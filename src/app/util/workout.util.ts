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