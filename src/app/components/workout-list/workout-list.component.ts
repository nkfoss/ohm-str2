import {
    Component,
    OnInit,
    Pipe,
    PipeTransform,
    computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { Workout } from '../../models/workout.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
    MatDatepickerInputEvent,
    MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatLuxonDateModule } from '@angular/material-luxon-adapter';
import { MatFormFieldModule } from '@angular/material/form-field';
import { WorkoutListItemComponent } from './workout-list-item/workout-list-item/workout-list-item.component';
import { MatDialog } from '@angular/material/dialog';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { WorkoutStore } from '../../store/workout.store';
import { TypeaheadChipListComponent } from '../complex/typeahead-chip-list/typeahead-chip-list.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
import { DateNavComponent } from '../date-nav/date-nav.component';

@Pipe({
    name: 'millisToLocalDateString',
    standalone: true,
})
export class MillisToLocalDateStringPipe implements PipeTransform {
    transform(millis?: number): string {
        if (millis === undefined) {
            return '';
        }
        const navDateFormat: DateTimeFormatOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        };
        return DateTime.fromMillis(millis).toLocaleString(navDateFormat);
    }
}
@Pipe({
    name: 'workoutSort',
    standalone: true,
})
export class WorkoutSortPipe implements PipeTransform {
    transform(workouts: Workout[] | null): Workout[] {
        if (workouts) {
            return workouts.sort((a, b) => a.instantMillis - b.instantMillis);
        }
        return [];
    }
}

@Component({
    selector: 'app-workout-list',
    standalone: true,
    imports: [
        DateNavComponent,
        WorkoutListItemComponent,
        CommonModule,
        MatIconModule,
        MatCardModule,
        MatButtonModule,
        MatDatepickerModule,
        MatLuxonDateModule,
        MatFormFieldModule,
        MillisToLocalDateStringPipe,
        WorkoutSortPipe,
        TypeaheadChipListComponent,
    ],
    templateUrl: './workout-list.component.html',
    styleUrl: './workout-list.component.scss',
})
export class WorkoutListComponent implements OnInit {
    $params = toSignal(this.route.queryParams);
    $selectedMillis = computed(() => {
        const params = this.$params();
        if (params && params['day'] && params['month'] && params['year']) {
            return DateTime.fromFormat(
                params['day'] + params['month'] + params['year'],
                'dMyyyy'
            ).toMillis();
        } else {
            return undefined;
        }
    });
    $selectedWorkouts = computed(() => {
        const selectedMillis = this.$selectedMillis();
        if (selectedMillis) {
            return this.workoutStore.$workouts().filter((workout) => {
                return (
                    DateTime.fromMillis(workout.instantMillis)
                        .startOf('day')
                        .toMillis() ==
                    DateTime.fromMillis(selectedMillis)
                        .startOf('day')
                        .toMillis()
                );
            });
        } else {
            return [];
        }
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private workoutStore: WorkoutStore
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(_ => {
            this.workoutStore.fetchWorkouts();
        })
    }

    onEditWorkout(workoutId?: string) {
        this.router.navigate(['edit'], {
            relativeTo: this.route,
            queryParams: { id: workoutId, ...this.$params() },
        });
    }

    onDeleteWorkout(workoutId: string) {
        const dialogRef = this.dialog.open<
            ConfirmationDialogComponent,
            ConfirmationDialogData
        >(ConfirmationDialogComponent, {
            data: {
                message: 'Are you sure you want to delete this workout?',
                confirmButtonColor: 'warn',
            },
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.workoutStore.deleteWorkout(workoutId);
            }
        });
    }

    changeDate(delta: number) {
        const params = this.$params();
        if (params) {
            let dt = DateTime.fromFormat(
                params['day'] + params['month'] + params['year'],
                'dMyyyy'
            );
            dt = dt.plus({ days: delta})
            this.router.navigate(this.route.snapshot.url, {
                queryParams: { day: dt.day, month: dt.month, year: dt.year  },
            });
        }
    }

    onCalendarDatePicked(event: MatDatepickerInputEvent<DateTime>) {
        if (event.value) {
            const dt = event.value
            this.router.navigate(this.route.snapshot.url, {
                queryParams: { day: dt.day, month: dt.month, year: dt.year  },
            });
        }
    }

    chipList: string[] = [];
    onTagSelected(event: MatAutocompleteSelectedEvent) {
        this.chipList.push(event.option.value);
    }
}
