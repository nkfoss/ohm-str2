import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, map, of } from 'rxjs';
import { Exercise } from '../models/workout.model';
import { baseUrl } from '../constants/app.constants';

interface ExercisesEntry {
    [key: string]: string;
}
@Injectable({
    providedIn: 'root',
})
export class ExerciseService {
    readonly url = baseUrl + 'exercises.json';

    constructor(private http: HttpClient) {}

    private createdExercise$ = new Subject<Exercise>();

    fetchExercises(): Observable<Exercise[]> {
        return this.http
            .get<ExercisesEntry>(this.url)
            .pipe(
                map((res) =>
                    Object.entries(res).map(([id, name]) => ({
                        id: id,
                        name: name,
                    }))
                )
            );
    }

    createNewExercise(exercise: Exercise) {
        this.saveExercise(exercise).subscribe((ex) => {
            this.createdExercise$.next(ex);
        });
    }

    saveExercise(exercise: any) {
        const exercisesEntry: ExercisesEntry = {};
        exercisesEntry[exercise.id] = exercise.name.name;
        return this.http.patch<ExercisesEntry>(this.url, exercisesEntry).pipe(
            map((res) => {
                return {id: Object.keys(res)[0], name: Object.values(res)[0]};
            })
        );
    }

    deleteExercise(id: string) {
        return of(false);
    }
}
