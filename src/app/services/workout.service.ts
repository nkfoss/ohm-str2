import { Injectable } from '@angular/core';
import { Workout } from '../models/workout.model';
import { Observable, map, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../constants/app.constants';

interface WorkoutsOnServer {
    [key: string]: Omit<Workout, 'id'>;
}

@Injectable({
    providedIn: 'root',
})
export class WorkoutService {
    readonly url = baseUrl + 'workouts';
    readonly SUFFIX = '.json'

    constructor(private http: HttpClient) {}

    fetchWorkouts() {
        return this.http.get<WorkoutsOnServer>(this.url + this.SUFFIX).pipe(
            map((res) => {
                let workouts: Workout[] = [];
                for (const workoutId in res) {
                    workouts.push({
                        id: workoutId,
                        ...res[workoutId],
                    });
                }
                return workouts;
            })
        );
    }

    saveAllWorkouts(workouts: Workout[]): Observable<Workout[]> {
        const toServer: WorkoutsOnServer = {};
        workouts.forEach(({ id, ...rest }) => {
            toServer[id ?? uuidv4()] = rest;
        });
        return this.http.patch<WorkoutsOnServer>(this.url + this.SUFFIX, toServer).pipe(
            map((res) => {
                let workouts: Workout[] = [];
                for (const tagId in res) {
                    workouts.push({ id: tagId, ...res[tagId] } as Workout);
                }
                return workouts;
            })
        );
    }

    deleteWorkout(workoutId: string) {
        return this.http.delete<WorkoutsOnServer>(this.url + `/${workoutId}` + this.SUFFIX);
    }
}
