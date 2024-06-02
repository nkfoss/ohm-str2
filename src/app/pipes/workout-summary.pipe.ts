import { Pipe, PipeTransform } from "@angular/core";
import { ExerciseBlock } from "../models/workout.model";

@Pipe({
    name: 'workoutSummary',
    standalone: true
})
export class WorkoutSummaryPipe implements PipeTransform{
    transform(exerciseBlocks: ExerciseBlock[]) {
        return exerciseBlocks;
    }
    
}