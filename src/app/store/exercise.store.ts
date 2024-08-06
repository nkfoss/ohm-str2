import { Injectable } from "@angular/core";
import { Exercise } from "../models/workout.model";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { ExerciseService } from "../services/exercise.service";
import { Observable, exhaustMap } from "rxjs";
import { filterNullish } from "../util/filterNullish";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GenericSnackBarData, GenericSnackbarComponent } from "../components/snackbars/generic-snackbar/generic-snackbar.component";

export interface ExerciseState {
    exercises: Exercise[];
    newExercise: Exercise | undefined;
}
const DEFAULT_STATE: ExerciseState = {
    exercises: [],
    newExercise: undefined
}
@Injectable({
    providedIn: 'root',
    
})
export class ExerciseStore extends ComponentStore<ExerciseState> {

    constructor(private exerciseService: ExerciseService, private snackBar: MatSnackBar) {
        super(DEFAULT_STATE);
    }

    readonly exercises$ = this.select((state) => state.exercises);
    readonly $exercises = this.selectSignal(state => state.exercises);
    readonly newExercise$ = this.select((state) => state.newExercise);

    readonly fetchExercises = this.effect(trigger$ => {
        return trigger$.pipe(
            exhaustMap(() => 
                this.exerciseService.fetchExercises().pipe(
                    tapResponse(
                        (exercises) => this.setState(state => ({...state, exercises: exercises})),
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly addExercise = this.effect((exercise$: Observable<Exercise | undefined>) => {
        return exercise$.pipe(
            filterNullish(),
            exhaustMap((exercise) => 
                this.exerciseService.saveExercise(exercise).pipe(
                    tapResponse(
                        (exercise) => {
                            this.showSuccessSnackbar(exercise.name);
                            this.setState(state => {
                                return {...state, exercises: [...state.exercises, exercise], newExercise: exercise}
                            })
                        },
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    private showSuccessSnackbar(exerciseName?: string) {
        this.snackBar.openFromComponent<
            GenericSnackbarComponent,
            GenericSnackBarData
        >(GenericSnackbarComponent, {
            data: {
                status: 'success',
                message: `Created exercise "${exerciseName}"!`,
            },
            verticalPosition: 'bottom',
            panelClass: ['generic-snack-bar-success'],
            duration: 2000,
        });
    }

    readonly updateExercise = this.effect((exercise$: Observable<Exercise | undefined>) => {
        return exercise$.pipe(
            filterNullish(),
            exhaustMap((exercise) => 
                this.exerciseService.saveExercise(exercise).pipe(
                    tapResponse(
                        (updated) => {
                            this.setState(state => {
                                return {
                                    ...state, 
                                    exercises: state.exercises.map(exercise => {
                                        if (updated.id === exercise.id) {
                                            return updated;
                                        }
                                        return exercise;
                                    })}
                            })
                        },
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly deleteExercise = this.effect((id$: Observable<string | undefined>) => {
        return id$.pipe(
            filterNullish(),
            exhaustMap((id) => 
                this.exerciseService.deleteExercise(id).pipe(
                    tapResponse(
                        (res) =>  this.setState(state => ({ ...state, exercises: state.exercises.filter(ex => id !== ex.id) })),
                        (err: Error) => console.error(err),
                    )
                )
            )
        )
    })

}