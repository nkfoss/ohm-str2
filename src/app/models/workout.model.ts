
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
export interface _Workout extends Omit<Workout, 'exerciseBlocks' | 'id'> {
    exerciseBlockIds: string[];
}
export interface ExerciseBlock extends UserInteractable {
    id: string;
    exerciseId: string;
    sets: ExerciseSet[];
}
export interface _ExerciseBlock extends Omit<ExerciseBlock, 'id'> {
    workoutId: string;
    instantMillis: number;
}
export interface Exercise extends UserInteractable {
    name: string;
    id: string;
}
export interface _Exercise extends Omit<Exercise, 'id'> {}
export interface ExerciseSet extends UserInteractable {
    id?: string;
    weight?: number;
    reps?: number;
}
export interface Tag {
    id: string;
    name: string;
}
export interface _Tag extends Omit<Tag, 'id'> {}
export interface PersonalRecord {
    id?: string;
    exerciseName?: string;
    setPath?: string;
    oldRecord?: ExerciseSet;
    newRecord?: ExerciseSet;
}
export class FirebaseFilter<T, K extends keyof T> {
    orderBy: string;
    equalTo: T[K]

    constructor(orderBy: K, equalTo: T[K]) {
        this.orderBy = `"${String(orderBy)}"`;
        if (typeof equalTo === 'string') {
            this.equalTo = `"${equalTo}"` as T[K];
          } else {
            this.equalTo = equalTo;
          }
    }
}