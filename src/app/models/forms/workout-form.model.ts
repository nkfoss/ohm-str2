import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    UntypedFormControl,
} from '@angular/forms';
import { Exercise, ExerciseBlock, Set, Workout } from '../workout.model';

export class WorkoutForm {
    fb = new FormBuilder();
    name = new FormControl<string>('');
    description = new FormControl<string>('');
    exerciseBlocks = new FormArray<FormGroup<ExerciseBlockForm>>([]);

    constructor(workout?: Workout) {
        if (workout) {
            this.name.setValue(workout.name ?? '');
            this.description.setValue(workout.description ?? '');
            const fb = new FormBuilder();
            workout.exerciseBlocks?.forEach((block) => {
                this.exerciseBlocks.push(
                    fb.group(new ExerciseBlockForm(block))
                );
            });
        }
    }
}

export class ExerciseBlockForm {
    // exercise = new FormControl<Exercise>({});
    sets = new FormArray<FormGroup<SetForm>>([]);
    notes = new FormControl<string>('');
    tags = new FormControl<string[]>([]);

    constructor(exerciseBlock?: ExerciseBlock) {
        if (exerciseBlock) {
            const fb = new FormBuilder();
            // this.exercise = new FormControl<Exercise>(exerciseBlock.exercise);
            exerciseBlock.sets?.forEach((set) => {
                this.sets.push(fb.group(new SetForm(set)));
            });
        }
    }
}

export class SetForm {
    weight = new FormControl<number>(0);
    reps = new FormControl<number>(0);
    notes = new FormControl<string>('');
    tags = new FormControl<string[]>([]);

    checked = new FormControl<boolean>(false);

    constructor(set?: Set) {
        if (set) {
            this.weight.setValue(set.weight ?? 0);
            this.reps.setValue(set.reps ?? 0);
            this.notes.setValue(set.notes ?? '');
            this.tags.setValue(set.tagIds ?? []);
        }
    }
}
