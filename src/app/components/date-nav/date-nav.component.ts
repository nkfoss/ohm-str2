import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
    MatDatepickerInputEvent,
    MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-date-nav',
    standalone: true,
    imports: [MatButtonModule, MatDatepickerModule, MatIconModule],
    templateUrl: './date-nav.component.html',
    styleUrl: './date-nav.component.scss',
})
export class DateNavComponent {
    @Output()
    rightArrowClicked: EventEmitter<void> = new EventEmitter();

    @Output()
    leftArrowClicked: EventEmitter<void> = new EventEmitter();

    @Output()
    calendarDatePicked: EventEmitter<MatDatepickerInputEvent<any, any>> =
        new EventEmitter();

    @Input()
    dateString: string = '';
}
