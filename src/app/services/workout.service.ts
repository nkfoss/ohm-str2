import { Injectable } from '@angular/core';
import {
    ExerciseBlock,
    FirebaseFilter,
    Workout,
    _ExerciseBlock,
    _Workout,
} from '../models/workout.model';
import { Observable, forkJoin, map, switchMap, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../constants/app.constants';
import {
    ExerciseBlocksEntry,
    ExerciseBlockService,
} from './exercise-block.service';

interface WorkoutsEntry {
    [key: string]: _Workout;
}

@Injectable({
    providedIn: 'root',
})
export class WorkoutService {
    readonly url = baseUrl + 'workouts';
    readonly SUFFIX = '.json';

    constructor(
        private http: HttpClient,
        private exerciseBlockService: ExerciseBlockService
    ) {}

    deleteWorkout(workoutId: string) {
        return this.http.delete<WorkoutsEntry>(
            this.url + `/${workoutId}` + this.SUFFIX
        );
    }

    fetchWorkouts(instantMillis: number): Observable<Workout[]> {
        return this.http
            .get<WorkoutsEntry>(this.url + this.SUFFIX, {
                params: {
                    ...new FirebaseFilter<_Workout, 'instantMillis'>(
                        'instantMillis',
                        instantMillis
                    ),
                },
            })
            .pipe(
                switchMap((workoutsResponse) => {
                    const requestsForBlocks = Object.keys(workoutsResponse).map(
                        (id) =>
                            this.exerciseBlockService.fetchExerciseBlocks(id)
                    );
                    return forkJoin(requestsForBlocks).pipe(
                        map((exerciseBlockArrArr) => {
                            return this.mapBlocksToWorkouts(
                                exerciseBlockArrArr,
                                workoutsResponse
                            );
                        })
                    );
                })
            );
    }

    saveWorkout(workout: Workout): Observable<Workout> {
        const workoutsEntry: WorkoutsEntry =
            this.convertToWorkoutsEntry(workout);
        const blocksEntry: ExerciseBlocksEntry =
            this.convertToExerciseBlocksEntry(workout);

        let workoutsEntryRes: WorkoutsEntry;
        return this.http
            .patch<WorkoutsEntry>(this.url + this.SUFFIX, workoutsEntry)
            .pipe(
                tap((res) => (workoutsEntryRes = res)),
                switchMap(() =>
                    this.http.patch<ExerciseBlocksEntry>(
                        baseUrl + 'exercise-blocks' + this.SUFFIX,
                        blocksEntry
                    )
                ),
                map((exerciseBlocksEntryRes) =>
                    this.convertEntriesToWorkout(
                        workoutsEntryRes,
                        exerciseBlocksEntryRes
                    )
                )
            );
    }

    private mapBlocksToWorkouts(
        blocks: ExerciseBlock[][],
        res: WorkoutsEntry
    ): Workout[] {
        const workouts: Workout[] = [];
        Object.keys(res).forEach((id, index) => {
            const { exerciseBlockIds, ...rest } = res[id];
            workouts.push({
                id: id,
                exerciseBlocks: blocks[index],
                ...rest,
            });
        });
        return workouts;
    }

    private convertEntriesToWorkout(
        workoutsEntry: WorkoutsEntry,
        blocksEntry: ExerciseBlocksEntry
    ): Workout {
        const workoutId = Object.keys(workoutsEntry)[0];
        const { exerciseBlockIds, ...rest } = Object.values(workoutsEntry)[0];
        const workout: Workout = {
            id: workoutId,
            exerciseBlocks: Object.entries(blocksEntry)
                .filter(([id, block]) => block.workoutId === workoutId)
                .map(([id, block]) => {
                    const { workoutId, instantMillis, ...rest } = block;
                    return {
                        id: id,
                        ...rest,
                    };
                }),
            ...rest,
        };
        return workout;
    }

    private convertToWorkoutsEntry(workout: Workout): WorkoutsEntry {
        const workoutsEntry: WorkoutsEntry = {};
        const { id, exerciseBlocks, ...rest } = workout;
        workoutsEntry[workout.id ?? uuidv4()] = {
            exerciseBlockIds: exerciseBlocks.map((block) => block.id),
            ...rest,
        };
        return workoutsEntry;
    }

    private convertToExerciseBlocksEntry(
        workout: Workout
    ): ExerciseBlocksEntry {
        const blocksEntry: ExerciseBlocksEntry = {};
        workout.exerciseBlocks.forEach((block) => {
            const { id, ...rest } = block;
            blocksEntry[block.id] = {
                workoutId: workout.id,
                instantMillis: workout.instantMillis,
                ...rest,
            };
        });
        return blocksEntry;
    }
}
