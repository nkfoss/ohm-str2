import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatLuxonDateModule } from '@angular/material-luxon-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { DateTime } from 'luxon';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        MatDatepickerModule,
        MatFormFieldModule,
        MatLuxonDateModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
})
export class HomeComponent {

    constructor(private router: Router) {}

    selectedDateControl = new FormControl(
        DateTime.local()
    )
    onNavigateToWorkoutDate() {
        const dt = this.selectedDateControl.value;
        this.router.navigate(
            ['/workouts'],
            { queryParams: {day: dt?.day, month: dt?.month, year: dt?.year} }
        )
    }

}
