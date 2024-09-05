import { Component, Inject, OnInit } from '@angular/core';
import { Exercise } from '../../models/workout.model';
import {
    ExerciseBlockService,
    ExerciseHistoryItem,
} from '../../services/exercise-block.service';
import { MatTableModule } from '@angular/material/table';
import {
    MAT_DIALOG_DATA,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle,
} from '@angular/material/dialog';

@Component({
    selector: 'app-exercise-history',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatTableModule],
    template: `
        @if (dataSource.length) {
        <h1 mat-dialog-title>{{ exercise.name }} history</h1>
        <div mat-dialog-content>
            <table mat-table [dataSource]="dataSource" class="mat-elevation-z2">
                <ng-container matColumnDef="isoString">
                    <th mat-header-cell *matHeaderCellDef>Date</th>
                    <td mat-cell *matCellDef="let element">
                        {{ element.isoString }}
                    </td>
                </ng-container>
                <ng-container matColumnDef="exerciseBlockSummary">
                    <th mat-header-cell *matHeaderCellDef>Summary</th>
                    <td mat-cell *matCellDef="let element">
                        {{ element.exerciseBlockSummary }}
                    </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr
                    mat-row
                    *matRowDef="let row; columns: displayedColumns"
                ></tr>
            </table>
        </div>
        }
    `,
})
export class ExerciseHistoryComponent implements OnInit {
    dataSource: ExerciseHistoryItem[] = [];
    displayedColumns: (keyof ExerciseHistoryItem)[] = [
        'isoString',
        'exerciseBlockSummary',
    ];

    constructor(
        private exerciseBlockService: ExerciseBlockService,
        public dialogRef: MatDialogRef<ExerciseHistoryComponent, void>,
        @Inject(MAT_DIALOG_DATA) public exercise: Exercise
    ) {}

    ngOnInit() {
        this.exerciseBlockService
            .fetchExerciseHistory(this.exercise.id)
            .subscribe((historyItems) => (this.dataSource = historyItems));
    }
}
