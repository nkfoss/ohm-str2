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

    qwe() {
        this.http.get<string>('http://localhost:8080/hello-world').subscribe(res => console.log(res));
    }

    deleteWorkout(workout: Workout): Observable<null> {
        const deleteReqs: Observable<null>[] = [];
        deleteReqs.push(
            ...workout.exerciseBlocks.map(block => this.exerciseBlockService.delete(block.id)),
            this.http.delete<null>(this.url + `/${workout.id}` + this.SUFFIX)
        )
        return forkJoin(deleteReqs).pipe(map(() => null))
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
                            this.exerciseBlockService.fetchExerciseBlocksForWorkout(
                                id
                            )
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

    saveWorkout(workout: Workout, blockIdsToDelete?: string[]): Observable<Workout> {
        const workoutsEntry: WorkoutsEntry =
            this.convertToWorkoutsEntry(workout);
        const blocksEntry: ExerciseBlocksEntry =
            this.convertToExerciseBlocksEntry(workout, blockIdsToDelete);

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
        workoutsEntry: WorkoutsEntry
    ): Workout[] {
        const workouts: Workout[] = [];
        Object.keys(workoutsEntry).forEach((workoutId, index) => {
            const { exerciseBlockIds, ...rest } = workoutsEntry[workoutId];
            const blocksFromDb = blocks[index] ?? [];
            const blocksForWorkout: ExerciseBlock[] = [];
            exerciseBlockIds?.forEach((exerciseBlockId) => {
                const matchFromDb = blocksFromDb.find(
                    (block) => block.id === exerciseBlockId
                );
                if (matchFromDb) {
                    matchFromDb.sets = matchFromDb.sets ?? [];
                    blocksForWorkout.push(matchFromDb);
                }
            });
            workouts.push({
                id: workoutId,
                exerciseBlocks: blocksForWorkout,
                ...rest,
            });
        });
        return workouts;
    }

    private convertEntriesToWorkout(
        workoutsEntry: WorkoutsEntry,
        blocksEntry: ExerciseBlocksEntry
    ): Workout {
        console.log('converting entries to wo');
        const workoutId = Object.keys(workoutsEntry)[0];
        const { exerciseBlockIds, ...rest } = Object.values(workoutsEntry)[0];
        const workout: Workout = {
            id: workoutId,
            exerciseBlocks: Object.entries(blocksEntry)
                .filter(([id, block]) => {
                    return block?.workoutId === workoutId // block is optional for case where block was deleted
                })
                .map(([id, block]) => {
                    const { workoutId, instantMillis, sets, ...rest } = block;
                    return {
                        id: id,
                        sets: sets ?? [],
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
        workout: Workout, blockIdsToDelete?: string[]
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
        blockIdsToDelete?.forEach(id => blocksEntry[id] = null as unknown as _ExerciseBlock) // TODO: Figure out a better way
        return blocksEntry;
    }
}
