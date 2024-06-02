import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { Exercise } from '../models/workout.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root',
})
export class ExerciseService {
    constructor(private http: HttpClient) {}

    private cachedExercises$ = new BehaviorSubject<Exercise[]>([]);
    public cachedExercises: Exercise[] = [];
    private createdExercise$ = new Subject<Exercise>();

    getCreatedExercise(): Observable<Exercise> {
        return this.createdExercise$;
    }

    getCachedExercises(): Observable<Exercise[]> {
        return this.cachedExercises$;
    }

    fetchExercises() {
        return this.fetchExercisesFromServer();
    }

    private fetchExercisesFromServer() {
        return of(this.exercisesOnServer.slice());
    }

    createNewExercise(exercise: Exercise) {
        this.saveExerciseToServer(exercise).subscribe(ex => {
            this.createdExercise$.next(ex);
            this.saveExerciseToCache(ex);
        })
    }

    saveExercise(toSave: Exercise) {
        return this.saveExerciseToServer(toSave);
    }

    private saveExerciseToCache(toSave: Exercise) {
        const i = this.cachedExercises.findIndex((ex) => ex.id === toSave.id);
        if (i >= 0) {
            this.cachedExercises.splice(i, 1);
        } else {
            this.cachedExercises.push(toSave);
        }
        this.cachedExercises$.next(this.cachedExercises.slice());
    }

    private saveExerciseToServer(toSave: Exercise) {
        const i = this.exercisesOnServer.findIndex((ex) => (ex.id === toSave.id));
        if (i >= 0) {
            this.exercisesOnServer[i] = toSave;
        } else {
            toSave.id = uuidv4();
            this.exercisesOnServer.push(toSave);
        }
        return of({...toSave});
    }

    deleteExercise(id: string) {
        return this.deleteExerciseFromServer(id);
    }

    private deleteExerciseFromServer(id: string) {
        const i = this.exercisesOnServer.findIndex((ex) => ex.id === id);
        if (i >= 0) {
            this.exercisesOnServer.splice(i, 1);
            return of(true);
        } else {
            return of(false);
        }
    }

    private exercisesOnServer: Exercise[] = [
        {
            name: 'Bench Press',
            id: 'Bench Press',
        },
        {
            name: 'Push Press',
            id: 'Push Press',

        },
        {
            name: 'Tricep Pushdown',
            id: 'Tricep Pushdown',

        },
    ];
}
