import { Component, OnDestroy, OnInit } from '@angular/core';
import {
    Exercise,
    ExerciseBlock,
    Workout,
} from '../../../models/workout.model';
import { ActivatedRoute } from '@angular/router';
import { ExerciseBlockComponent } from './exercise-block.component.ts/exercise-block/exercise-block.component';
import { AsyncPipe, CommonModule, Location } from '@angular/common';
import { WorkoutForm } from '../../../models/forms/workout-form.model';
import {
    BehaviorSubject,
    Observable,
    Subject,
    Subscription,
    filter,
    map,
    skip,
    takeUntil,
} from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
    AddBlockDialogComponent,
    AddBlockDialogData,
} from '../../dialogs/add-block-dialog/add-block-dialog.component';
import { filterNullish } from '../../../util/filterNullish';
import { v4 as uuidv4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { TypeaheadChipListComponent } from '../../typeahead-search/typeahead-chip-list/typeahead-chip-list.component';
import { WorkoutStore } from '../../../store/workout.store';
import { ExerciseStore } from '../../../store/exercise.store';
import { TagStore } from '../../../store/tag.store';

export class WorkoutDataForm {
    name = new FormControl<string>('');
    description = new FormControl<string>('');
    notes = new FormControl<string>('');

    constructor(name?: string, description?: string, notes?: string) {
        this.name.setValue(name ?? '');
        this.description.setValue(description ?? '');
        this.notes.setValue(notes ?? '');
    }
}

@Component({
    selector: 'app-edit-workout',
    standalone: true,
    imports: [
        AsyncPipe,
        CommonModule,
        ExerciseBlockComponent,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        TypeaheadChipListComponent,
    ],
    templateUrl: './edit-workout.component.html',
    styleUrl: './edit-workout.component.scss',
})
export class EditWorkoutComponent implements OnInit, OnDestroy {
    selectedWorkoutId: string = '';
    selectedWorkoutSub!: Subscription;
    selectedWorkout!: Workout;
    onDestroy$: Subject<void> = new Subject();
    exerciseBlocks$ = new BehaviorSubject<ExerciseBlock[]>([]);
    workoutForm!: WorkoutForm;
    exercises: Exercise[] = [];
    workoutDataForm: FormGroup<WorkoutDataForm> = new FormGroup(
        new WorkoutDataForm()
    );
    tagNames: string[] = [];

    readonly changes: boolean = false;
    hasSaved: boolean = false;

    constructor(
        private workoutStore: WorkoutStore,
        private exerciseStore: ExerciseStore,
        private tagStore: TagStore,
        private route: ActivatedRoute,
        private location: Location,
        private dialog: MatDialog
    ) {}

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe((params) => {
            this.selectedWorkoutId = params.get('id') + '';
        });
        this.tagStore.fetchTags();
        this.selectedWorkoutSub = this.workoutStore.workouts$
            .pipe(
                takeUntil(this.onDestroy$),
                map((workouts) =>
                    workouts
                        .filter(
                            (workout) => workout.id === this.selectedWorkoutId
                        )
                        .pop()
                )
            )
            .subscribe((workout) => {
                if (workout) {
                    this.selectedWorkout = JSON.parse(JSON.stringify(workout));
                    this.exerciseBlocks$.next(
                        this.selectedWorkout.exerciseBlocks
                    );
                }
            });
        this.exerciseStore.exercises$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((exercises) => {
                this.exercises = exercises;
            });
    }

    onAddBlock() {
        const dialogRef = this.dialog.open<
            AddBlockDialogComponent,
            AddBlockDialogData,
            string
        >(AddBlockDialogComponent, {
            width: '400px',
            data: { exercises: this.exercises.slice() },
        });
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((exerciseName: string) => {
                const match = this.exercises.find(
                    (ex) => ex.name === exerciseName
                );
                if (match) {
                    this.addNewBlock(match.id);
                } else {
                    this.confirmCreateNewExercise(exerciseName)
                        .pipe(filter((confirm) => !!confirm))
                        .subscribe((confirmed) => {
                            this.addNewBlockOnExerciseCreation(exerciseName);
                        });
                }
            });
    }

    private confirmCreateNewExercise(name: string): Observable<boolean> {
        const dialogRef = this.dialog.open<
            ConfirmationDialogComponent,
            ConfirmationDialogData,
            boolean
        >(ConfirmationDialogComponent, {
            width: '400px',
            data: {
                title: 'Create New Exercise',
                message: `Create new exercise ${name}?`,
            },
        });
        return dialogRef.afterClosed().pipe(filterNullish());
    }

    private addNewBlockOnExerciseCreation(exerciseName: string) {
        this.exerciseStore.newExercise$.pipe(skip(1)).subscribe((created) => {
            if (created) {
                this.addNewBlock(created.id);
            }
        });
        this.exerciseStore.addExercise({
            name: exerciseName,
        });
    }

    private addNewBlock(exerciseId?: string) {
        const newBlock: ExerciseBlock = {
            id: uuidv4(),
            exerciseId: exerciseId,
            sets: [],
        };
        this.selectedWorkout.exerciseBlocks.push(newBlock);
        this.exerciseBlocks$.next(this.selectedWorkout.exerciseBlocks.slice());
    }

    onSave() {
        this.workoutStore.addWorkout(this.selectedWorkout);
        this.hasSaved = true;
    }

    onDeleteBlock(id: string) {
        const index = this.selectedWorkout.exerciseBlocks.findIndex(
            (block) => block.id === id
        );
        if (index >= 0) {
            const copy = this.selectedWorkout.exerciseBlocks.slice();
            copy.splice(index, 1);
            this.selectedWorkout.exerciseBlocks = copy;
            this.exerciseBlocks$.next(this.selectedWorkout.exerciseBlocks);
        }
    }

    onNavigateBack() {
        if (this.changes) {
            const dialogRef = this.dialog.open<
                ConfirmationDialogComponent,
                ConfirmationDialogData
            >(ConfirmationDialogComponent, {
                data: { message: 'Discard unsaved changes?' },
            });
            dialogRef.afterClosed().subscribe((confirmed) => {
                if (confirmed) {
                    this.location.back();
                }
            });
        } else {
            this.location.back();
        }
    }
}
