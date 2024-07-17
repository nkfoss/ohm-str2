import { Component, Inject } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';
import {
    TypeaheadResult,
    TypeaheadSearchComponent,
} from '../../typeahead-search/typeahead-search.component';
import { Exercise } from '../../../models/workout.model';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ExerciseService } from '../../../services/exercise.service';

export interface AddBlockDialogData {
    exercises: Exercise[];
}
@Component({
    selector: 'app-add-block-dialog',
    standalone: true,
    imports: [
        TypeaheadSearchComponent,
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
    ],
    templateUrl: './add-block-dialog.component.html',
    styles: `
        .main-container { overflow-y: hidden; } 
        .actions-container { 
            display: flex; 
            justify-content: 
            flex-end; padding: 0 20px 20px 0; 
        }
    `,
})
export class AddBlockDialogComponent {
    exerciseName: string = '';
    searchTerm: string = '';
    searchResults: TypeaheadResult[] = [];
    typeaheadValueFormCtl: FormControl = new FormControl<string>('');
    typeaheadDisplayFormCtl: FormControl = new FormControl<string>('');

    constructor(
        public exerciseServce: ExerciseService,
        public dialogRef: MatDialogRef<AddBlockDialogComponent, any>,
        @Inject(MAT_DIALOG_DATA) public data: AddBlockDialogData
    ) {}

    search(search: string) {
        this.searchTerm = search;
        this.searchResults = this.data.exercises
            .filter((ex) =>
                ex.name?.toLowerCase().includes(search.toLowerCase())
            )
            .map((exercise) => {
                return {
                    disabled: false,
                    result: exercise,
                };
            });
    }

    onCancel() {
        this.dialogRef.close();
    }

    onAddBlock() {
        if (this.typeaheadValueFormCtl.value === '') {
            this.dialogRef.close(this.searchTerm);
        } else {
            this.dialogRef.close(this.typeaheadValueFormCtl.value);
        }
    }
}
