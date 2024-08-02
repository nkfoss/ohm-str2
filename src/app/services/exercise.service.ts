import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, map, of } from 'rxjs';
import { Exercise } from '../models/workout.model';
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from '../constants/app.constants';

interface ExercisesResponse {
    [key: string]: Omit<Exercise, 'id'>
}
@Injectable({
    providedIn: 'root',
})
export class ExerciseService {
    readonly url = baseUrl + 'exercises.json';

    constructor(private http: HttpClient) {}

    private createdExercise$ = new Subject<Exercise>();

    fetchExercises() {
        return this.http.get<ExercisesResponse>(this.url).pipe(
            map(res => {
                let exercises: Exercise[] = [];
                for (const exerciseId in res) {
                    exercises.push({id: exerciseId, ...res[exerciseId]})
                }
                return exercises;
            })
        );
    }

    createNewExercise(exercise: Exercise) {
        this.saveExercise(exercise).subscribe(ex => {
            this.createdExercise$.next(ex);
        })
    }

    saveExercise(exercise: Exercise) {
        const toServer: any = {};
        const id = exercise.id ?? uuidv4();
        toServer[id] = {
            ...exercise,
            id: undefined,
        }
        return this.http.patch<ExercisesResponse>(this.url, toServer).pipe(
            map(res => {
                let workout: Partial<Exercise> = {};
                for (const id in res) {
                    workout = {
                        id: id,
                        ...res[id]
                    }
                }
                return workout as Exercise;
            })
        )
    }

    deleteExercise(id: string) {
        return of(false);
    }

}
