import { Component, Input } from '@angular/core';
import { JoinPipe } from '../../pipes/join.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { EditTagsDialogComponent, EditTagsDialogData } from '../dialogs/edit-tags/edit-tags-dialog.component';

@Component({
    selector: 'app-tags-manager',
    standalone: true,
    imports: [JoinPipe, MatIconModule],
    templateUrl: './tags-manager.component.html',
    styleUrl: './tags-manager.component.scss',
})
export class TagsManagerComponent {
    @Input()
    $tagNames: string[] = [];

    constructor(private dialog: MatDialog) {}

    onEditTags() {
        const dialogRef = this.dialog.open<
            EditTagsDialogComponent,
            EditTagsDialogData,
            string[]
        >(EditTagsDialogComponent, {
            width: '400px',
            data: {
                tagIds: this.workout.tagIds ?? [],
            },
        });
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((tagIds) => {
                this.workout.tagIds = tagIds;
            });
    }
}
