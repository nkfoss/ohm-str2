import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

export type GenericSnackBarStatus = 'success' | 'error';

export interface GenericSnackBarData {
    status: GenericSnackBarStatus;
    message?: string;
    showDismissButton?: boolean;
}

@Component({
    selector: 'app-generic-snackbar',
    standalone: true,
    imports: [MatButtonModule],
    template: `
        <div class="generic-snack-bar-container">
            <div class="generic-snack-bar-message-container">
                {{ message }}
            </div>
            @if (data.showDismissButton) {
            <div>
                <button mat-flat-button (click)="onDismiss()">Dismiss</button>
            </div>
            }
        </div>
    `,
    styles: `
        .generic-snackbar-success {
            background: green;
            color: white;
            min-height: 40px;
            margin: 15px;
            font-size: 14px;
        }
        .generic-snackbar-error {
            background: red;
            color: white;
            min-height: 40px;
            margin: 15px;
            font-size: 14px;
        }
        .generic-snack-bar-container {
            display: flex;
            justify-content: center;

            .generic-snack-bar-message-container {
                padding: 0 10px 0 0;
            }
        }
    `,
    encapsulation: ViewEncapsulation.None,
})
export class GenericSnackbarComponent {
    message: string = '';

    constructor(
        private snackBar: MatSnackBar,
        @Inject(MAT_SNACK_BAR_DATA) public data: GenericSnackBarData
    ) {
        if (data.message) {
            this.message = data.message;
        } else if (data.status === 'success') {
            this.message = 'Success!';
        } else if (data.status === 'error') {
            this.message = 'An error occurred.';
        }
    }

    onDismiss() {
        this.snackBar.dismiss();
    }
}
