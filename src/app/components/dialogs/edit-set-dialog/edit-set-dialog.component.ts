import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Set } from '../../../models/workout.model';

@Component({
  selector: 'app-edit-set-dialog',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  templateUrl: './edit-set-dialog.component.html',
  styleUrl: './edit-set-dialog.component.scss'
})
export class EditSetDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<EditSetDialogComponent, Set>,
        @Inject(MAT_DIALOG_DATA) public data: Set
    ) {}

    onCancel() {
        this.dialogRef.close();
    }

    onSave() {
        this.dialogRef.close(this.data);
    }
}
