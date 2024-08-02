import { Injectable } from '@angular/core';
import { Tag } from '../models/workout.model';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from '../constants/app.constants';

interface TagsOnServer {
    [key: string]: Omit<Tag, 'id'>
}

@Injectable({
    providedIn: 'root',
})
export class TagService {

    readonly url  = baseUrl + 'tags.json';
    constructor(private http: HttpClient) {}

    fetchTags() {
        return this.http.get<TagsOnServer>(this.url).pipe(
            map(res => {
                let tags: Tag[] = [];
                for (const tagId in res) {
                    tags.push({id: tagId, ...res[tagId]})
                }
                return tags;
            })
        )
    }

    saveAllTags(tags: Tag[]): Observable<Tag[]> {
        const toServer: TagsOnServer = {};
        tags.forEach(({id, ...rest}) => {
            const tagId = id ?? uuidv4();
            toServer[tagId] = rest
        });
        return this.http.patch<TagsOnServer>(this.url, toServer).pipe(
            map(res => {
                let tags: Tag[] = [];
                for (const tagId in res) {
                    tags.push({id: tagId, ...res[tagId]})
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
