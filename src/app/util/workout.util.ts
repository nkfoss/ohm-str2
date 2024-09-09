import { Workout } from "../models/workout.model";
import { v4 as uuidv4 } from 'uuid';


export function buildWorkout(instantMillis: number): Workout {
    return {
        id: uuidv4(),
        name: 'New workout',
        exerciseBlocks: [],
        instantMillis: instantMillis
    }
}

export function copyWorkout(instantMillis: number, workout: Workout): Workout {
    return {
        ...workout,
        id: uuidv4(),
        instantMillis: instantMillis,
        name: `Copy of ${workout.name}`,
        exerciseBlocks: workout.exerciseBlocks.map(block => ({...block, id: uuidv4()}))
    }
}