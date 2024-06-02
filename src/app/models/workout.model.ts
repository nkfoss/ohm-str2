
export interface UserInteractable {
    notes?: string;
    tagIds?: string[]
}

export interface Workout extends UserInteractable{
    id: string;
    name: string;
    description: string;
    instantMillis: number;
    exerciseBlocks: ExerciseBlock[];
}
export interface WorkoutView extends Workout {
    tags: Tag[];
}

export interface ExerciseBlock extends UserInteractable {
    id: string;
    exerciseId?: string;
    sets: Set[];
}
export interface ExerciseBlockView extends ExerciseBlock {
    exerciseName: string;
}

export interface Exercise extends UserInteractable {
    name?: string;
    id?: string;
}

export interface Set extends UserInteractable {
    id?: string;
    weight?: number;
    reps?: number;
}

export interface Tag {
    id: string;
    name: string;
}

export interface PersonalRecord {
    id?: string;
    exerciseName?: string;
    setPath?: string;
    oldRecord?: Set;
    newRecord?: Set;
}