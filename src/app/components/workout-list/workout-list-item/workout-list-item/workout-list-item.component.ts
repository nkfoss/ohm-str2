import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    Pipe,
    PipeTransform,
    SimpleChanges,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { WorkoutSummaryPipe } from '../../../../pipes/workout-summary.pipe';
import {
    Exercise,
    ExerciseBlock,
    Workout,
} from '../../../../models/workout.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { JoinPipe } from '../../../../pipes/join.pipe';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { ExerciseStore } from '../../../../store/exercise.store';
import { TagStore } from '../../../../store/tag.store';

@Pipe({
    name: 'exerciseBlockSummary',
    standalone: true,
})
export class ExerciseBlockSummaryPipe implements PipeTransform {
    transform(millis: number, formatOptions: DateTimeFormatOptions): string {
        return DateTime.fromMillis(millis).toLocaleString(formatOptions);
    }
}

@Component({
    selector: 'app-workout-list-item',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        WorkoutSummaryPipe,
        MatTableModule,
        CommonModule,
        JoinPipe,
    ],
    templateUrl: './workout-list-item.component.html',
    styleUrl: './workout-list-item.component.scss',
})
export class WorkoutListItemComponent implements OnChanges, OnDestroy {
    @Input()
    workout!: Workout;

    @Output()
    editWorkout = new EventEmitter<string>();

    @Output()
    deleteWorkout = new EventEmitter<string>();

    onDestroy$ = new Subject<void>();

    displayedColumns: string[] = ['exerciseName', 'exerciseBlockSummary'];
    dataSource: ExerciseBlockTableData[] = [];

    tagNames: string[] = [];

    constructor(private exerciseStore: ExerciseStore, private tagStore: TagStore) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.exerciseStore.exercises$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((exercises) => {
                this.dataSource = this.workout.exerciseBlocks.map(
                    (exerciseBlock) =>
                        this.createExerciseBlockTableData(
                            exerciseBlock,
                            exercises
                        )
                );
            });
        this.tagStore.tags$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((tags) => {
                this.tagNames = tags.filter(tag => this.workout.tagIds?.includes(tag.id)).map(tag => tag.name);
            })
        this.exerciseStore.fetchExercises();
        this.tagStore.fetchTags();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private createExerciseBlockTableData(
        exerciseBlock: ExerciseBlock,
        exercises: Exercise[]
    ): ExerciseBlockTableData {
        let setSummary = '';
        if (exerciseBlock.sets.length === 1) {
            setSummary = '1 set performed';
        } else if (exerciseBlock.sets.length > 1) {
            setSummary = exerciseBlock.sets.length + ' sets performed';
        }
        const exerciseName = exercises.find(
            (ex) => ex.id === exerciseBlock.exerciseId
        )?.name;
        return {
            exerciseName: exerciseName ?? 'not found',
            excerciseBlockSummary: setSummary,
        };
    }

    onEditWorkout() {
        this.editWorkout.emit(this.workout.id);
    }

    onDeleteWorkout() {
        this.deleteWorkout.emit(this.workout.id);
    }
}

export interface ExerciseBlockTableData {
    exerciseName?: string;
    excerciseBlockSummary?: string;
}
