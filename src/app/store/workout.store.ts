import { Injectable } from "@angular/core";
import { Exercise, Workout } from "../models/workout.model";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { WorkoutService } from "../services/workout.service";
import { Observable, exhaustMap } from "rxjs";
import { filterNullish } from "../util/filterNullish";
import { TagStore } from "./tag.store";

export interface WorkoutState {
    workouts: Workout[]
}
const DEFAULT_STATE: WorkoutState = {
    workouts: []
}
@Injectable({
    providedIn: 'root',
})
export class WorkoutStore extends ComponentStore<WorkoutState> {

    exercises: Exercise[] = [];

    constructor(private workoutService: WorkoutService, private tagStore: TagStore) {
        super(DEFAULT_STATE);
    }

    private readonly tags$ = this.tagStore.tags$
    readonly workouts$ = this.select((state) => state.workouts);
    readonly $workouts = this.selectSignal((state) => state.workouts);

    private readonly setWorkouts = this.updater(
        (state: WorkoutState, workouts: Workout[]) => ({
            ...state, workouts
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

    readonly fetchWorkouts = this.effect((timestamp$: Observable<number | undefined>) => {
        return timestamp$.pipe(
            filterNullish(),
            exhaustMap((timestamp: number) => 
                this.workoutService.fetchWorkouts(timestamp).pipe(
                    tapResponse(
                        (workouts) => this.setWorkouts(workouts),
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly addWorkout = this.effect((workout$: Observable<Workout | undefined>) => {
        return workout$.pipe(
            filterNullish(),
            exhaustMap((workout) => 
                this.workoutService.saveWorkout(workout).pipe(
                    tapResponse(
                        (workout) => {
                            this.setState(state => {
                                return {...state, workouts: [...state.workouts, workout]}
                            })
                            console.log("workouts", this.$workouts())
                        },
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly saveWorkout = this.effect((workout$: Observable<Workout | undefined>) => {
        return workout$.pipe(
            filterNullish(),
            exhaustMap((workout) => 
                this.workoutService.saveWorkout(workout).pipe(
                    tapResponse(
                        (updated) => {
                            this.updateWorkout(updated);
                        },
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly deleteWorkout = this.effect((id$: Observable<string | undefined>) => {
        return id$.pipe(
            filterNullish(),
            exhaustMap((id) => 
                this.workoutService.deleteWorkout(id).pipe(
                    tapResponse(
                        (res) => {
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