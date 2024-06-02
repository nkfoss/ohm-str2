import { Injectable } from "@angular/core";
import { Tag, Workout } from "../models/workout.model";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { WorkoutService } from "../services/workout.service";
import { Observable, exhaustMap } from "rxjs";
import { filterNullish } from "../util/filterNullish";
import { TagService } from "../services/tag.service";

export interface TagState {
    tags: Tag[]
}
const DEFAULT_STATE: TagState = {
    tags: []
}
@Injectable({
    providedIn: 'root',
})
export class TagStore extends ComponentStore<TagState> {

    constructor(private tagService: TagService) {
        super(DEFAULT_STATE);
    }

    readonly tags$ = this.select((state) => state.tags)

    readonly fetchTags = this.effect(trigger$ => {
        return trigger$.pipe(
            exhaustMap(() => 
                this.tagService.fetchTags().pipe(
                    tapResponse(
                        (tags) => this.setState(state => ({...state, tags: tags})),
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly addTag = this.effect((tag$: Observable<Tag | undefined>) => {
        return tag$.pipe(
            filterNullish(),
            exhaustMap((tag) => 
                this.tagService.saveTag(tag).pipe(
                    tapResponse(
                        (tag) => {
                            this.setState(state => {
                                return {...state, tags: [...state.tags, tag]}
                            })
                        },
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly updateTag = this.effect((tag$: Observable<Tag | undefined>) => {
        return tag$.pipe(
            filterNullish(),
            exhaustMap((tag) => 
                this.tagService.saveTag(tag).pipe(
                    tapResponse(
                        (updated) => {
                            this.setState(state => {
                                return {
                                    ...state, 
                                    tags: state.tags.map(tag => {
                                        if (updated.id === tag.id) {
                                            return updated;
                                        }
                                        return tag;
                                    })}
                            })
                        },
                        (err) => console.error(err),
                    )
                )
            )
        )
    })

    readonly deleteTag = this.effect((id$: Observable<string | undefined>) => {
        return id$.pipe(
            filterNullish(),
            exhaustMap((id) => 
                this.tagService.deleteTag(id).pipe(
                    tapResponse(
                        (res) =>  this.setState(state => ({ ...state, tags: state.tags.filter(workout => id !== workout.id) })),
                        (err: Error) => console.error(err),
                    )
                )
            )
        )
    })

}