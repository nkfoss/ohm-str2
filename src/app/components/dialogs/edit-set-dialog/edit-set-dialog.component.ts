import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ExerciseSet } from '../../../models/workout.model';

@Component({
    selector: 'app-edit-set-dialog',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
    ],
    templateUrl: './edit-set-dialog.component.html',
    styles: `
        .main-container {
            display: flex;
            flex-direction: column;
        }
          .actions-container { 
            display: flex; 
            justify-content: flex-end; 
            padding: 0 20px 20px 0; 
        }`,
})
export class EditSetDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<EditSetDialogComponent, ExerciseSet>,
        @Inject(MAT_DIALOG_DATA) public data: ExerciseSet
    ) {}

    onCancel() {
        this.dialogRef.close();
    }

    onSave() {
        this.dialogRef.close(this.data);
    }
}
