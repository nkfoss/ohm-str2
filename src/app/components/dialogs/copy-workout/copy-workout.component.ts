import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    MatLuxonDateModule,
    provideLuxonDateAdapter,
} from '@angular/material-luxon-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'app-copy-workout',
    standalone: true,
    imports: [
        MatDatepickerModule,
        MatDialogModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        MatLuxonDateModule,
    ],
    providers: [provideLuxonDateAdapter()],
    template: `
        <div class="main-container">
            <h1 mat-dialog-title>Copy Workout</h1>
            <div mat-dialog-content>
                <mat-form-field>
                    <mat-label>Select a target date</mat-label>
                    <input
                        matInput
                        [matDatepicker]="picker"
                        [(ngModel)]="selectedDate"
                    />
                    <mat-datepicker-toggle
                        class="picker-toggle"
                        matIconSuffix
                        [for]="picker"
                    ></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                </mat-form-field>
            </div>
            <div mat-dialog-actions class="actions-container">
                <button mat-raised-button (click)="onCancel()">Cancel</button>
                <button
                    mat-raised-button
                    color="primary"
                    (click)="onConfirm()"
                    [disabled]="!selectedDate"
                >
                    Confirm
                </button>
            </div>
        </div>
    `,
    styles: `
    .main-container { overflow-y: hidden; } 
    .actions-container { 
        display: flex; 
        justify-content: 
        flex-end; padding: 0 20px 20px 0; 
    }
  `,
})
export class CopyWorkoutComponent {
    selectedDate: Date | undefined = undefined;

    constructor(public dialogRef: MatDialogRef<CopyWorkoutComponent, any>) {}

    onCancel() {
        this.dialogRef.close();
    }

    onConfirm() {
        this.dialogRef.close(this.selectedDate);
    }
}
