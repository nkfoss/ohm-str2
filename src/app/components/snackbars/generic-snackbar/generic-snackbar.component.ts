import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

export interface GenericSnackBarData {
    message?: string,
    showDismissButton?: boolean
}

@Component({
  selector: 'app-generic-snackbar',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './generic-snackbar.component.html',
  styleUrl: './generic-snackbar.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class GenericSnackbarComponent {
    constructor(
        private snackBar: MatSnackBar,
        @Inject(MAT_SNACK_BAR_DATA) public data: GenericSnackBarData
    ) {}

    onDismiss() {
        this.snackBar.dismiss();
    }
}
