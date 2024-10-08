import { Injectable, computed } from '@angular/core';
import { Workout } from '../models/workout.model';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { WorkoutService } from '../services/workout.service';
import {
    EMPTY,
    Observable,
    catchError,
    exhaustMap,
    switchMap,
    tap,
} from 'rxjs';
import { filterNullish } from '../util/filterNullish';
import { GeneralState, StateStatus } from './general-state.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    GenericSnackBarData,
    GenericSnackbarComponent,
} from '../components/snackbars/generic-snackbar/generic-snackbar.component';
import { toObservable } from '@angular/core/rxjs-interop';

export interface WorkoutState extends GeneralState {
    workouts: Workout[];
    selectedWorkoutId: string | undefined;
}
const DEFAULT_STATE: WorkoutState = {
    workouts: [],
    selectedWorkoutId: undefined,
    status: 'normal',
};
@Injectable({
    providedIn: 'root',
})
export class WorkoutStore extends ComponentStore<WorkoutState> {
    constructor(
        private workoutService: WorkoutService,
        private snackBar: MatSnackBar
    ) {
        super(DEFAULT_STATE);
    }

    readonly status$ = this.select((state) => state.status);
    readonly $status = this.selectSignal((state) => state.status);
    readonly workouts$ = this.select((state) => state.workouts);
    readonly $workouts = this.selectSignal((state) => state.workouts);
    readonly selectedWorkoutId$ = this.select(
        (state) => state.selectedWorkoutId
    );
    readonly $selectedWorkoutId = this.selectSignal(
        (state) => state.selectedWorkoutId
    );
    readonly $selectedWorkout = computed(() => {
        const selected = this.$workouts().find(
            (workout) => workout.id === this.$selectedWorkoutId()
        );
        return selected!;
    });
    readonly selectedWorkout$ = toObservable(this.$selectedWorkout)

    readonly setStatus = this.updater(
        (state: WorkoutState, status: StateStatus) => ({
            ...state,
            status: status,
        })
    );

    private readonly setWorkouts = this.updater(
        (state: WorkoutState, workouts: Workout[]) => ({
            ...state,
            workouts,
        })
    );

    private readonly setSelectedWorkoutId = this.updater(
        (state: WorkoutState, id: string) => ({
            ...state,
            selectedWorkoutId: id,
        })
    );

    updateWorkout = this.updater((state, updated: Workout) => {
        let updatedList = [...state.workouts];
        const index = state.workouts.findIndex(
            (existing) => existing.id === updated.id
        );
        if (index >= 0) {
            updatedList[index] = updated;
        } else {
            updatedList.push(updated);
        }
        return { ...state, workouts: updatedList };
    });

    selectWorkout(id: string | undefined) {
        this.patchState({
            selectedWorkoutId: id,
        });
    }

    readonly fetchWorkouts = this.effect((millis$: Observable<number>) => {
        return millis$.pipe(
            exhaustMap((millis) =>
                this.workoutService.fetchWorkouts(millis).pipe(
                    tapResponse(
                        (workouts) => this.setWorkouts(workouts),
                        (err) => console.error(err)
                    )
                )
            )
        );
    });

    readonly saveWorkout = this.effect(
        (workout$: Observable<Workout | undefined>) => {
            return workout$.pipe(
                filterNullish(),
                switchMap((workout) => {
                    this.setStatus('processing');
                    const currentBlockIds = this.$selectedWorkout()?.exerciseBlocks.map(block => block.id);
                    const savedBlockIds = workout.exerciseBlocks.map(block => block.id);
                    const toDelete = currentBlockIds?.filter(currentBlockId => savedBlockIds.indexOf(currentBlockId) < 0);
                    return this.workoutService.saveWorkout(workout, toDelete).pipe(
                        tap({
                            next: (saved) => {
                                this.setStatus('complete');
                                this.updateWorkout(saved);
                                this.setStatus('normal');
                            },
                            error: (err) => {
                                this.showSnackbar(
                                    'error',
                                    'An error occured. Workout not saved.'
                                );
                                this.setStatus('error');
                            },
                        }),
                        catchError(() => EMPTY)
                    );
                })
            );
        }
    );

    readonly deleteWorkout = this.effect(
        (id$: Observable<string | undefined>) => {
            return id$.pipe(
                filterNullish(),
                exhaustMap((id) => {
                    const workout = this.$workouts().find(
                        (workout) => workout.id === id
                    );
                    return this.workoutService.deleteWorkout(workout!).pipe(
                        tapResponse(
                            () => {
                                this.setState((state) => {
                                    return {
                                        ...state,
                                        workouts: state.workouts.filter(
                                            (workout) => id !== workout.id
                                        ),
                                    };
                                });
                            },
                            (err: Error) => console.error(err)
                        )
                    );
                })
            );
        }
    );

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
