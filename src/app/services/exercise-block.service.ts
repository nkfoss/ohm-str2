import { Injectable } from '@angular/core';
import {
    ExerciseBlock,
    ExerciseSet,
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
export interface ExerciseHistoryItem {
    isoString: string;
    exerciseBlockSummary: string;
}

@Injectable({
    providedIn: 'root',
})
export class ExerciseBlockService {
    readonly url = baseUrl + 'exercise-blocks';
    readonly SUFFIX = '.json';
    readonly WORKOUT_ID = 'workoutId';

    constructor(private http: HttpClient) {}

    delete(id: string) {
        return this.http.delete<null>(
            this.url + `/${id}` + this.SUFFIX
        );
    }

    fetchExerciseBlocksForWorkout(
        workoutId: string
    ): Observable<ExerciseBlock[]> {
        return this.http
            .get<ExerciseBlocksEntry>(this.url + this.SUFFIX, {
                params: {
                    ...new FirebaseFilter<_ExerciseBlock, 'workoutId'>(
                        'workoutId',
                        workoutId
                    ),
                },
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

    fetchExerciseHistory(
        exerciseId: string
    ): Observable<ExerciseHistoryItem[]> {
        return this.http
            .get<ExerciseBlocksEntry>(this.url + this.SUFFIX, {
                params: {
                    ...new FirebaseFilter<_ExerciseBlock, 'exerciseId'>(
                        'exerciseId',
                        exerciseId
                    ),
                },
            })
            .pipe(
                map((res) => {
                    let items: ExerciseHistoryItem[] = [];
                    for (const id in res) {
                        items.push({
                            isoString: new Date(res[id].instantMillis)
                                .toISOString()
                                .substring(0, 10),
                            exerciseBlockSummary: this.createBlockSummary(
                                res[id].sets
                            ),
                        });
                    }
                    return items.sort(function (a, b) {
                        return b.isoString.localeCompare(a.isoString);
                    });
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

    createBlockSummary(sets: ExerciseSet[]): string {
        if (!sets.length) {
            return 'No sets';
        } else {
            let summary = '';
            let lastWeight: number;
            sets.forEach((set, i) => {
                if (i === 0) {
                    summary += set.weight + 'x' + set.reps;
                } else if (lastWeight === set.weight) {
                    summary += ',' + set.reps;
                } else {
                    summary += ' ' + set.weight + 'x' + set.reps;
                }
                lastWeight = set.weight!;
            });
            return summary;
        }
    }
}
