import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";

export interface ConfirmationDialogData {
    title?: string;
    message?: string;
    confirmButtonText?: string;
    confirmButtonColor?: string;
    denyButtonText?: string;
    denyButtonColor?: string;
}
@Component({
    selector: 'confirmation-dialog-component',
    template: `
    <div class='main-container'>
        <h2 mat-dialog-title>{{ data.title ?? 'Attention!' }}</h2>
        <div mat-dialog-content>
            <p>{{ data.message ?? 'Please confirm your action.' }}</p>
        </div>
        <div mat-dialog-actions class="actions-container">
            <button
                mat-raised-button
                [color]=" data.confirmButtonColor ?? 'primary'"
                (click)="onConfirm()"
            >
                {{ data.confirmButtonText ?? 'Confirm' }}
            </button>
            <button
                mat-raised-button
                [color]="'secondary'"
                (click)="onDeny()"
            >
                {{ data.denyButtonText ?? 'Cancel' }}
            </button>
        </div>
</div>
    `,
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, CommonModule, MatButtonModule],
    styles: `
        .main-container { overflow-y: hidden; } 
        .actions-container { 
            display: flex; 
            justify-content: 
            flex-end; padding: 0 20px 20px 0; 
        }
    `
})
export class ConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
    ) {}

    onConfirm() {
        this.dialogRef.close(true);
    }

    onDeny() {
        this.dialogRef.close();
    }
}