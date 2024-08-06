import {
    Component,
    Inject,
    OnChanges,
    OnInit,
    SimpleChanges,
    computed,
    signal,
} from '@angular/core';
import { Tag } from '../../../models/workout.model';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TypeaheadChipListComponent } from '../../complex/typeahead-chip-list/typeahead-chip-list.component';
import { TagStore } from '../../../store/tag.store';
import { ChipListItemWrapper } from '../../chip-list/chip-list.component';
import { FormControl } from '@angular/forms';

export interface EditTagsDialogData {
    tagIds: string[];
}

@Component({
    selector: 'app-edit-tags',
    standalone: true,
    imports: [
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        TypeaheadChipListComponent,
    ],
    templateUrl: './edit-tags-dialog.component.html',
    styles: `
        .main-container { overflow-y: hidden; } 
        .actions-container { 
            display: flex; 
            justify-content: flex-end; 
            padding: 0 20px 20px 0; 
    }
`,
})
export class EditTagsDialogComponent implements OnInit, OnChanges {
    constructor(
        private tagStore: TagStore,
        public dialogRef: MatDialogRef<EditTagsDialogComponent, any>,
        @Inject(MAT_DIALOG_DATA) public data: EditTagsDialogData
    ) {}

    tags: Partial<Tag>[] = [];
    $tags = signal(this.tags);
    $chipListItems = computed<ChipListItemWrapper[]>(() => {
        return this.$tags().map((tag) => {
            return {
                color: tag.id ? 'primary' : 'accent',
                item: tag,
            };
        });
    });

    ngOnInit(): void {
        this.tags = this.tagStore
            .$tags()
            .filter((tag) => this.data.tagIds.includes(tag.id));
        this.$tags.update(() => [...this.tags]);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tags']) {
            this.$tags.update(() => [...this.tags]);
        }
    }

    // ====== Chiplist typeahead ===========
    typeaheadDisplayFormControl: FormControl<string> = new FormControl();
    onTagNameSubmitted(tagName: string) {
        if (
            !this.tagSearchResults.map((tag) => tag.name).includes(tagName) &&
            !this.tags.map((tag) => tag.name).includes(tagName)
        ) {
            this.tags.push({ name: tagName });
            this.$tags.update(() => [...this.tags]);
            this.typeaheadDisplayFormControl.reset();
        }
    }
    tagSearchResults: Tag[] = [];
    onTagSearch(search: string) {
        this.tagSearchResults = this.tagStore
            .$tags()
            .filter((tag) => tag.name.toLowerCase().includes(search.toLowerCase()));
    }
    onTagSelected(event: MatAutocompleteSelectedEvent) {
        this.tags.push(event.option.value);
        this.$tags.update(() => [...this.tags]);
        this.typeaheadDisplayFormControl.reset();
        this.tagSearchResults = [];
    }
    onChipRemoved(index: number) {
        if (index >= 0) {
            this.tags.splice(index, 1);
            console.log(this.tags)
            this.$tags.update(() => [...this.tags])
        }
    }
    // =======================================

    onCancel() {
        this.dialogRef.close();
    }
    onSave() {
        this.dialogRef.close(this.tags);
    }
}
