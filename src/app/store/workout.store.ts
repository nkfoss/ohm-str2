import { Injectable, computed } from "@angular/core";
import { Exercise, Workout } from "../models/workout.model";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { WorkoutService } from "../services/workout.service";
import { Observable, exhaustMap, finalize, switchMap } from "rxjs";
import { filterNullish } from "../util/filterNullish";
import { GeneralState } from "./general-state.model";

export interface WorkoutState extends GeneralState {
    workouts: Workout[]
    selectedWorkoutId: string | undefined;
}
const DEFAULT_STATE: WorkoutState = {
    workouts: [],
    selectedWorkoutId: undefined,
    loading: false
}
@Injectable({
    providedIn: 'root',
})
export class WorkoutStore extends ComponentStore<WorkoutState> {

    exercises: Exercise[] = [];

    constructor(private workoutService: WorkoutService) {
        super(DEFAULT_STATE);
    }

    readonly loading$ = this.select((state) => state.loading);
    readonly $loading = this.selectSignal((state) => state.loading);
    readonly workouts$ = this.select((state) => state.workouts);
    readonly $workouts = this.selectSignal((state) => state.workouts);
    readonly selectedWorkoutId$ = this.select((state) => state.selectedWorkoutId);
    readonly $selectedWorkoutId = this.selectSignal((state) => state.selectedWorkoutId);
    readonly $selectedWorkout = computed(() => {
        return this.$workouts().find(workout => workout.id === this.$selectedWorkoutId())
    })

    private readonly setLoading = this.updater(
        (state: WorkoutState, loading: boolean) => ({
            ...state, loading: loading
        })
    )

    private readonly setWorkouts = this.updater(
        (state: WorkoutState, workouts: Workout[]) => ({
            ...state, workouts
        })
    )

    private readonly setSelectedWorkoutId = this.updater(
        (state: WorkoutState, id: string) => ({
            ...state, selectedWorkoutId: id
        })
    )

    updateWorkout = this.updater((state, updated: Workout) => {
        let updatedList = [...state.workouts];
        const index = state.workouts.findIndex(existing => existing.id === updated.id)
        if (index >= 0) {
            updatedList[index] = updated;
        } else {
            updatedList.push(updated);
        }
        return {...state, workouts: updatedList}
    });

    selectWorkout(id: string | undefined) {
        this.patchState({
            selectedWorkoutId: id
        })
    }

    readonly fetchWorkouts = this.effect((trigger$: Observable<void>) => {
        return trigger$.pipe(
            exhaustMap(() => 
                this.workoutService.fetchWorkouts().pipe(
                    tapResponse(
                        (workouts) => this.setWorkouts(workouts),
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly saveWorkout = this.effect((workout$: Observable<Partial<Workout> | undefined>) => {
        return workout$.pipe(
            filterNullish(),
            switchMap((workout) => {
                this.setLoading(true);
                return this.workoutService.saveAllWorkouts([workout as Workout]).pipe(
                    tapResponse(
                        (res) => {
                            const saved = res.at(0);
                            if (saved) {
                                if (!workout.id) {
                                    this.setSelectedWorkoutId(saved.id);
                                }
                                this.updateWorkout(saved);
                            }
                        },
                        (err) => console.error(err),
                    ),
                    finalize(() => this.setLoading(false))
                )
            }
            )
        )
    })

    readonly deleteWorkout = this.effect((id$: Observable<string | undefined>) => {
        return id$.pipe(
            filterNullish(),
            exhaustMap((id) => 
                this.workoutService.deleteWorkout(id).pipe(
                    tapResponse(
                        () => {
                            this.setState(state => {
                                return {
                                    ...state, 
                                    workouts: state.workouts.filter(workout => id !== workout.id)
                                }
                            })
                        },
                        (err: Error) => console.error(err),
                    )
                )
            )
        )
    })
}