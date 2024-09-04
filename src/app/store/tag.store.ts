import { Injectable } from "@angular/core";
import { Tag } from "../models/workout.model";
import { ComponentStore, tapResponse } from "@ngrx/component-store";
import { Observable, exhaustMap } from "rxjs";
import { filterNullish } from "../util/filterNullish";
import { TagService } from "../services/tag.service";

export interface TagState {
    tags: Tag[]
    updatedTags: Tag[] | undefined;
}
const DEFAULT_STATE: TagState = {
    tags: [],
    updatedTags: undefined
}
@Injectable({
    providedIn: 'root',
})
export class TagStore extends ComponentStore<TagState> {

    constructor(private tagService: TagService) {
        super(DEFAULT_STATE);
    }

    readonly tags$ = this.select((state) => state.tags)
    readonly $tags = this.selectSignal((state) => state.tags)

    readonly updatedTags$ = this.select((state) => state.updatedTags)


    addTags = this.updater((state, newTags: Tag[]) => ({
        ...state,
        tags: [...state.tags, ...newTags]
    }))

    setUpdatedTags = this.updater((state, updatedTags: Tag[] | undefined) => ({
        ...state,
        updatedTags: updatedTags
    }));

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

    readonly saveAllTags = this.effect((tags$: Observable<Tag[] | undefined>) => {
        return tags$.pipe(
            filterNullish(),
            exhaustMap((tags) => 
                this.tagService.saveAllTags(tags).pipe(
                    tapResponse(
                        (newTags) => {
                            this.addTags(newTags);
                            this.setUpdatedTags(newTags);
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