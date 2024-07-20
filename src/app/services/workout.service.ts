import { Injectable } from '@angular/core';
import { ExerciseBlock, Workout } from '../models/workout.model';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class WorkoutService {
    constructor(private http: HttpClient) {}

    private cachedWorkouts$ = new BehaviorSubject<Workout[]>([]);
    private cachedWorkouts: Workout[] = [];

    private selectedWorkout$ = new BehaviorSubject<Workout>(this.newWorkout());

    getCachedWorkouts(): Observable<Workout[]> {
        return this.cachedWorkouts$;
    }

    getSelectedWorkout(): Observable<Workout> {
        return this.selectedWorkout$;
    }

    /**
     * Returns an array of saved workouts on the date represented by the millisecond-timestamp.
     * If none are found in memory, it queries the server and stores any results in memory (and returns them).
     * @param ts Milliseconds-timestamp to match for workout calendar date
     */
    fetchWorkouts(ts: number) {
        return this.fetchWorkoutsFromServer(ts);
    }

    selectWorkout(id: string) {
        const found = this.cachedWorkouts
            .filter((workout) => workout.id === id)
            .pop();
        if (found) {
            return { ...found };
        } else {
            return this.newWorkout();
        }
    }

    qwe() {
        this.http
            .put(
                'https://ohm-strength-default-rtdb.firebaseio.com/maa.json',
                this.onServer
            )
            .subscribe((response) => {
                console.log('response in service', response);
            });
    }

    saveWorkout(workout: Partial<Workout>) {
        return this.saveWorkoutToServer(workout);
    }

    deleteWorkout(workoutId: string) {
        return this.deleteWorkoutOnServer(workoutId);
    }

    newWorkout(): Workout {
        return {
            id: uuidv4(),
            name: '',
            description: '',
            instantMillis: Date.now(),
            exerciseBlocks: [],
            notes: '',
            tagIds: [],
        };
    }

    private fetchWorkoutsFromServer(ts: number): Observable<Workout[]> {
        // stubbed
        return of(this.filterWorkoutsOnDate(ts, this.onServer));
    }

    private saveWorkoutToServer(workout: Partial<Workout>): Observable<Workout> {
        const index = this.onServer.findIndex((el) => el.id === workout.id);
        if (index >= 0) {
            this.onServer[index] = workout as Workout;
        } else {
            workout.id = workout.id = uuidv4();
            workout.instantMillis = DateTime.now().toMillis();
            this.onServer.push(workout as Workout);
        }
        return of(workout as Workout);
    }

    private deleteWorkoutOnServer(workoutId: string): Observable<boolean> {
        const index = this.onServer.findIndex(
            (workout) => workout.id === workoutId
        );
        if (index >= 0) {
            this.onServer.splice(index, 1);
            return of(true);
        } else {
            return of(false);
        }
    }

    private filterWorkoutsOnDate(ts: number, workouts: Workout[]) {
        return workouts.filter((workout) => {
            return (
                DateTime.fromMillis(workout.instantMillis)
                    .startOf('day')
                    .toMillis() ==
                DateTime.fromMillis(ts).startOf('day').toMillis()
            );
        });
    }

    private exerciseBlocks: ExerciseBlock[] = [
        {
            id: 'qweasdzxc',
            exerciseId: 'Bench Press',
            sets: [
                {
                    weight: 100,
                    reps: 10,
                    notes: '',
                    tagIds: [],
                },
                {
                    weight: 100,
                    reps: 6,
                    notes: '',
                    tagIds: [],
                },
            ],
            notes: '',
            tagIds: [],
        },
        {
            id: 'asdzxcwer',
            exerciseId: 'Push Press',
            sets: [
                {
                    weight: 200,
                    reps: 10,
                    notes: '',
                    tagIds: [],
                },
            ],
            notes: '',
            tagIds: [],
        },
        {
            id: 'zxcwersdf',
            exerciseId: 'Tricep Pushdown',
            sets: [
                {
                    weight: 130,
                    reps: 15,
                    notes: '',
                    tagIds: [],
                },
            ],
            notes: '',
            tagIds: [],
        },
    ];
    private onServer: Workout[] = [
        {
            id: 'qwe-asd',
            instantMillis: DateTime.local().toMillis(),
            name: 'Today',
            description: "Today's Workout",
            exerciseBlocks: [...this.exerciseBlocks],
            notes: 'current',
            tagIds: ['1', '2'],
        },
        {
            id: 'qwe-asd0',
            instantMillis: DateTime.local().toMillis() + 1,
            name: 'Today',
            description: "Today's Workout...again",
            exerciseBlocks: [...this.exerciseBlocks],
            notes: 'current',
            tagIds: ['1','3'],
        },
        {
            id: 'asd-zxc',
            instantMillis: DateTime.local().minus({ days: 1 }).toMillis(),
            name: 'Yesterday',
            description: "Yesterday's Workout",
            exerciseBlocks: [...this.exerciseBlocks],
            notes: 'before',
            tagIds: ['3'],
        },
        {
            id: 'zxc-qwe',
            instantMillis: DateTime.local().plus({ days: 1 }).toMillis(),
            name: 'Tomorrow',
            description: "Tommorow's Workout",
            exerciseBlocks: [...this.exerciseBlocks],
            notes: 'after',
            tagIds: ['4'],
        },
    ];
}
