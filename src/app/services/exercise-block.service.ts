import { Injectable } from '@angular/core';
import {
    ExerciseBlock,
    FirebaseFilter,
    Workout,
    _ExerciseBlock,
} from '../models/workout.model';
import { Observable, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient } from '@angular/common/http';
import { baseUrl } from '../constants/app.constants';

export interface ExerciseBlocksEntry {
    [key: string]: _ExerciseBlock;
}

@Injectable({
    providedIn: 'root',
})
export class ExerciseBlockService {
    readonly url = baseUrl + 'exercise-blocks';
    readonly SUFFIX = '.json';
    readonly WORKOUT_ID = 'workoutId';

    constructor(private http: HttpClient) {}

    fetchExerciseBlocks(workoutId: string): Observable<ExerciseBlock[]> {
        return this.http
            .get<ExerciseBlocksEntry>(this.url + this.SUFFIX, {
                params: {...new FirebaseFilter<_ExerciseBlock, 'workoutId'>('workoutId', workoutId)},
            })
            .pipe(
                map((res) => {
                    let blocks: ExerciseBlock[] = [];
                    for (const id in res) {
                        blocks.push({
                            id: id,
                            ...res[id],
                        });
                    }
                    return blocks;
                })
            );
    }

    saveAllExerciseBlocks(workout: Workout): Observable<Workout> {
        const toServer: ExerciseBlocksEntry = {};
        workout.exerciseBlocks.forEach(({ id, ...rest }) => {
            toServer[id ?? uuidv4()] = {
                ...rest,
                workoutId: workout.id,
                instantMillis: workout.instantMillis,
            };
        });

        return this.http
            .patch<ExerciseBlocksEntry>(this.url + this.SUFFIX, toServer)
            .pipe(
                map((res) => {
                    const savedBlocks: ExerciseBlock[] = [];
                    for (var blockId in res) {
                        const { workoutId, instantMillis, ...rest } =
                            res[blockId];
                        savedBlocks.push({ id: blockId, ...rest });
                    }
                    workout.exerciseBlocks = savedBlocks;
                    return workout;
                })
            );
    }
}
