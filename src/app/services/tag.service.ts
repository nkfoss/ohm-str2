import { Injectable } from '@angular/core';
import { Tag } from '../models/workout.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { baseUrl } from '../constants/app.constants';

interface TagsEntry {
    [key: string]: string;
}

@Injectable({
    providedIn: 'root',
})
export class TagService {
    readonly url = baseUrl + 'tags.json';
    constructor(private http: HttpClient) {}

    fetchTags(): Observable<Tag[]> {
        return this.http
            .get<TagsEntry>(this.url)
            .pipe(
                map((res) =>
                    Object.entries(res).map(([id, tagName]) => ({
                        id: id,
                        name: tagName,
                    }))
                )
            );
    }

    saveAllTags(tags: Tag[]): Observable<Tag[]> {
        const tagsEntry: TagsEntry = {};
        tags.forEach(tag => tagsEntry[tag.id] = tag.name)
        return this.http.patch<TagsEntry>(this.url, tagsEntry).pipe(
            map((res) => {
                let tags: Tag[] = [];
                for (const tagId in res) {
                    tags.push({ id: tagId, name: res[tagId] });
                }
                return tags;
            })
        )
    }

    deleteTag(id: string): Observable<boolean> {
        return of(false);
        // const index = this.onServer.findIndex(
        //     (tag) => tag.id === id
        // );
        // if (index >= 0) {
        //     this.onServer.splice(index, 1);
        //     return of(true);
        // } else {
        //     return of(false);
        // }
    }
}
