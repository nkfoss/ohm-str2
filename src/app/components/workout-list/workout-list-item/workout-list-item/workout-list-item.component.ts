import {
    Component,
    EventEmitter,
    input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges,
    computed,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
    Exercise,
    ExerciseBlock,
    Tag,
    Workout,
} from '../../../../models/workout.model';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { Subject, take, takeUntil } from 'rxjs';
import { ExerciseStore } from '../../../../store/exercise.store';
import { TagStore } from '../../../../store/tag.store';
import { MatDialog } from '@angular/material/dialog';
import {
    EditTagsDialogComponent,
    EditTagsDialogData,
} from '../../../dialogs/edit-tags/edit-tags-dialog.component';
import { filterNullish } from '../../../../util/filterNullish';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '../../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { WorkoutStore } from '../../../../store/workout.store';
import { MatMenuModule } from '@angular/material/menu';
import { v4 as uuidv4 } from 'uuid';

@Component({
    selector: 'app-workout-list-item',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
    ],
    templateUrl: './workout-list-item.component.html',
    styleUrl: './workout-list-item.component.scss',
})
export class WorkoutListItemComponent implements OnChanges, OnDestroy {
    $workout = input.required<Workout>();

    @Output()
    editWorkout = new EventEmitter<string>();

    @Output()
    deleteWorkout = new EventEmitter<string>();

    @Output()
    copyWorkout = new EventEmitter<string>();

    onDestroy$ = new Subject<void>();

    displayedColumns: string[] = ['exerciseName', 'exerciseBlockSummary'];
    dataSource: ExerciseBlockTableData[] = [];

    $tagNames = computed(() => {
        const tags = this.$workout().tagIds;
        return this.tagStore
            .$tags()
            .filter((tag) => tags?.includes(tag.id))
            .map((tag) => tag.name);
    });
    $delimitedTagNames = computed(() => this.$tagNames().join(', '))

    constructor(
        private exerciseStore: ExerciseStore,
        private workoutStore: WorkoutStore,
        private tagStore: TagStore,
        private dialog: MatDialog
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        this.exerciseStore.exercises$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((exercises) => {
                const exerciseBlocks = this.$workout().exerciseBlocks ?? [];
                this.dataSource = exerciseBlocks.map((exerciseBlock) =>
                    this.createExerciseBlockTableData(exerciseBlock, exercises)
                );
            });
        this.exerciseStore.fetchExercises();
        this.tagStore.fetchTags();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    private createExerciseBlockTableData(
        block: ExerciseBlock,
        exercises: Exercise[]
    ): ExerciseBlockTableData {
        let blockSummary = this.createBlockSummary(block)
        const exerciseName = exercises.find(
            (ex) => ex.id === block.exerciseId
        )?.name;
        return {
            exerciseName: exerciseName ?? 'not found',
            excerciseBlockSummary: blockSummary,
        };
    }

    private createBlockSummary(block: ExerciseBlock): string {
        if (!block.sets.length) {
            return 'No sets'
        } else {
            let summary = '';
            let lastWeight: number;
            block.sets.forEach((set, i) => {
                if (i === 0) {
                    summary += set.weight + 'x' + set.reps;
                } else if (lastWeight === set.weight) {
                    summary += ',' + set.reps;
                } else {
                    summary += ' ' + set.weight + 'x' + set.reps;
                }
                lastWeight = set.weight!;
            })
            return summary;
        }
    }

    onEditTags() {
        const dialogRef = this.dialog.open<
            EditTagsDialogComponent,
            EditTagsDialogData,
            Tag[]
        >(EditTagsDialogComponent, {
            width: '400px',
            data: {
                tagIds: this.$workout().tagIds ?? [],
            },
            position: {
                top: `${window.innerHeight / 5}px`,
            },
        });
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((tags) => {
                this.$workout().tagIds = tags
                    .filter((tag) => !!tag.id)
                    .map((tag) => tag.id);
                const newTags = tags.filter((tag) => !tag.id);
                if (newTags.length) {
                    this.openNewTagConfirmation(newTags);
                } else {
                    this.$workout().tagIds = [...tags.map((tag) => tag.id)];
                    this.workoutStore.saveWorkout({
                        ...this.$workout(),
                        tagIds: [...tags.map((tag) => tag.id)],
                    });
                }
            });
    }

    openNewTagConfirmation(newTags: Tag[]) {
        const dialogRef = this.dialog.open<
            ConfirmationDialogComponent,
            ConfirmationDialogData,
            boolean
        >(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                title: 'Create new tags?',
                message: `Would you like to create ${newTags.length} new tag${
                    newTags.length > 1 ? 's' : ''
                }? (${newTags.map((tag) => `'${tag.name}'`).join(', ')})`,
            },
        });
        dialogRef.afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.tagStore.updatedTags$
                    .pipe(filterNullish(), take(1))
                    .subscribe((updatedTags) => {
                        this.$workout().tagIds?.push(
                            ...updatedTags.map((tag) => tag.id)
                        );
                        this.workoutStore.saveWorkout(this.$workout());
                        this.tagStore.setUpdatedTags(undefined);
                    });
                newTags.forEach(tag => tag.id = uuidv4())
                this.tagStore.saveAllTags(newTags);
            }
        });
    }
}

export interface ExerciseBlockTableData {
    exerciseName?: string;
    excerciseBlockSummary?: string;
}
