import { Component, OnDestroy, OnInit, computed } from '@angular/core';
import { ExerciseBlock, Workout } from '../../../models/workout.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseBlockComponent } from './exercise-block.component.ts/exercise-block/exercise-block.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { WorkoutForm } from '../../../models/forms/workout-form.model';
import { BehaviorSubject, Observable, Subject, filter, skip, take } from 'rxjs';
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
    Validators,
} from '@angular/forms';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { TypeaheadChipListComponent } from '../../complex/typeahead-chip-list/typeahead-chip-list.component';
import { WorkoutStore } from '../../../store/workout.store';
import { ExerciseStore } from '../../../store/exercise.store';
import { TagStore } from '../../../store/tag.store';
import { noEmptyStringValidator } from '../../validators/empty-string.validator';
import { DateTime } from 'luxon';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericSnackBarData, GenericSnackbarComponent } from '../../snackbars/generic-snackbar/generic-snackbar.component';

export class WorkoutDataForm {
    name = new FormControl<string>('', {
        validators: noEmptyStringValidator(),
        nonNullable: true,
    });
    description = new FormControl<string>('', { nonNullable: true });
    notes = new FormControl<string>('', { nonNullable: true });

    constructor(workout?: Partial<Workout>) {
        if (workout) {
            this.name.setValue(workout.name ?? '');
            this.description.setValue(workout.description ?? '');
            this.notes.setValue(workout.notes ?? '');
        }
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
    workout!: Workout;
    onDestroy$: Subject<void> = new Subject();
    exerciseBlocks$ = new BehaviorSubject<ExerciseBlock[]>([]);
    workoutForm!: WorkoutForm;
    $exercises = this.exerciseStore.$exercises;
    workoutDataForm: FormGroup<WorkoutDataForm> = new FormGroup(
        new WorkoutDataForm()
    );
    tagNames: string[] = [];
    $processing = computed(() => {
        return this.workoutStore.$status() === 'processing';
    });
    $params = toSignal(this.route.queryParams);
    $selectedMillis = computed(() => {
        const params = this.$params();
        if (params && params['day'] && params['month'] && params['year']) {
            return DateTime.fromFormat(
                params['day'] + params['month'] + params['year'],
                'dMyyyy'
            ).toMillis();
        } else {
            return undefined;
        }
    });

    readonly changes: boolean = false;
    hasSaved: boolean = false;

    constructor(
        private workoutStore: WorkoutStore,
        private exerciseStore: ExerciseStore,
        private snackBar: MatSnackBar,
        private tagStore: TagStore,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private router: Router
    ) {}

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    ngOnInit(): void {
        const selectedWorkoutId =
            this.route.snapshot.queryParamMap.get('id') ?? undefined;
        this.workoutStore.selectWorkout(selectedWorkoutId);
        this.tagStore.fetchTags(); // TODO: move to top of app
        const selectedWorkout = this.workoutStore.$selectedWorkout();
        if (selectedWorkout) {
            this.workout = { ...selectedWorkout };
            this.workoutDataForm = new FormGroup(
                new WorkoutDataForm(this.workout)
            );
        }
    }

    onAddBlock() {
        const dialogRef = this.openAddBlockDialog();
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((exerciseName: string) => {
                const match = this.$exercises().find(
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

    private openAddBlockDialog() {
        const dialogRef = this.dialog.open<
            AddBlockDialogComponent,
            AddBlockDialogData,
            string
        >(AddBlockDialogComponent, {
            width: '400px',
            position: {
                top: `${window.innerHeight / 5}px`,
            },
            data: { exercises: this.$exercises() },
        });
        return dialogRef;
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
            id: uuidv4(),
            name: exerciseName,
        });
    }

    private addNewBlock(exerciseId: string) {
        const newBlock: ExerciseBlock = {
            id: uuidv4(),
            exerciseId: exerciseId,
            sets: [],
        };
        this.workout.exerciseBlocks = [
            ...(this.workout.exerciseBlocks ?? []),
            newBlock,
        ];
        console.log("qwe")
        this.onSave();
    }

    onSave(showSnackbar?: boolean) {
        if (!this.workoutDataForm.valid || this.$processing()) {
            return;
        }
        this.workout = {
            ...this.workout,
            ...this.workoutDataForm.getRawValue(),
        };
        if (showSnackbar) {
            this.workoutStore.status$
            .pipe(filter(status => status === 'normal'), skip(1))
            .subscribe(status => {
                this.showSnackbar('success')
            });
        }
        this.workoutStore.saveWorkout(this.workout);
    }

    onDeleteBlock(id: string) {
        const index =
            this.workout.exerciseBlocks?.findIndex(
                (block) => block.id === id
            ) ?? -1;
        if (index >= 0) {
            const copy = this.workout.exerciseBlocks?.slice();
            copy?.splice(index, 1);
            this.workout.exerciseBlocks = copy;
        }
        this.onSave();
    }

    onNavigateBack() {
        const { id, ...params } = this.$params() as any;
        this.router.navigate(['workouts'], {
            queryParams: params,
        });
    }

    private showSnackbar(status: 'success' | 'error', message?: string) {
        this.snackBar.openFromComponent<
            GenericSnackbarComponent,
            GenericSnackBarData
        >(GenericSnackbarComponent, {
            data: {
                status: status,
                message: message,
            },
            verticalPosition: 'bottom',
            panelClass: 'generic-snackbar-success',
            // status === 'success'
            //     ? 'generic-snackbar-success'
            //     : 'generic-snackbar-error',

            duration: 2000,
        });
    }
}
