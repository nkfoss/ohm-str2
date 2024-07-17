import { Injectable } from '@angular/core';
import { Tag, UserInteractable } from '../models/workout.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TagService {
    constructor(private http: HttpClient) {}

    private cachedTags$ = new BehaviorSubject<Tag[]>([]);
    private cachedTags: Tag[] = [];

    getCachedTags(): Observable<Tag[]> {
        return this.cachedTags$;
    }

    fetchTags() {
        return this.fetchTagsFromServer();
    }

    private fetchTagsFromServer() {
        return of(this.onServer);
    }

    saveTag(tag: Tag): Observable<Tag> {
        const index = this.onServer.findIndex((el) => el.id === tag.id);
        if (index >= 0) {
            this.onServer[index] = tag;
        } else {
            this.onServer.push(tag);
        }
        return of(tag);
    }

    saveAllTags(tags: Tag[]): Observable<Tag[]> {
        tags.forEach(tag => tag.id = String(tag.name + 123));
        this.onServer = this.onServer.concat(tags);
        return of(tags);
    }

    deleteTag(id: string): Observable<boolean> {
        const index = this.onServer.findIndex(
            (tag) => tag.id === id
        );
        if (index >= 0) {
            this.onServer.splice(index, 1);
            return of(true);
        } else {
            return of(false);
        }
    }


    private onServer: Tag[] = [
        {
            id: '1',
            name: 'tag1'
        },
        {
            id: '2',
            name: 'tag2'
        },
        {
            id: '3',
            name: 'tag3'
        },
        {
            id: '4',
            name: 'bandit'
        },
    ];
}
