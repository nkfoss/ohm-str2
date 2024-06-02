import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";

export interface ConfirmationDialogData {
    title?: string;
    message?: string;
    confirmButtonText?: string;
    confirmButtonColor?: string;
    denyButtonText?: string;
    denyButtonColor?: string;
}
@Component({
    selector: 'confirmation-dialog',
    template: `
    <div class='main-container'>
        <h1 mat-dialog-title>{{ data.title ?? 'Attention!' }}</h1>
        <div mat-dialog-content>
            <p>{{ data.message ?? 'Please confirm your action.' }}</p>
        </div>
        <div mat-dialog-actions>
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
    imports: [MatDialogTitle, MatDialogContent, CommonModule, MatButtonModule],
})
export class ConfirmationDialog {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialog>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
    ) {}

    onConfirm() {
        this.dialogRef.close(true);
    }

    onDeny() {
        this.dialogRef.close();
    }
}