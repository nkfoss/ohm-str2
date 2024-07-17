import {
    Component,
    OnDestroy,
    OnInit,
    Pipe,
    PipeTransform,
    computed,
    signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { Workout } from '../../models/workout.model';
import { BehaviorSubject, Observable, Subject, map, takeUntil } from 'rxjs';
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
import { toSignal } from '@angular/core/rxjs-interop'; // Import toSignal from Angular RxJS interop

@Pipe({
    name: 'millisToLocalDateString',
    standalone: true,
})
export class MillisToLocalDateStringPipe implements PipeTransform {
    transform(millis: number, formatOptions: DateTimeFormatOptions): string {
        return DateTime.fromMillis(millis).toLocaleString(formatOptions);
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
export class WorkoutListComponent implements OnInit, OnDestroy {
    protected readonly navDateFormat: DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    };

    private onDestroy$: Subject<void> = new Subject();
    $selectedWorkouts = computed(() => {
        const workouts = this.workoutStore.$workouts().filter((workout) => {
            return (
                DateTime.fromMillis(workout.instantMillis)
                    .startOf('day')
                    .toMillis() ==
                DateTime.fromMillis(this.$selectedMillis())
                    .startOf('day')
                    .toMillis()
            );
        });
        console.log("computing workouts", workouts)
        return workouts;
    });
    $params = toSignal(this.route.queryParams);
    $selectedMillis = computed<number>(() => {
        const params = this.$params();
        if (params && params['day'] && params['month'] && params['year']) {
            return DateTime.fromFormat(
                params['day'] + params['month'] + params['year'],
                'dMyyyy'
            ).toMillis();
        } else {
            return 0;
        }
    });

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public dialog: MatDialog,
        private workoutStore: WorkoutStore
    ) {}

    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    ngOnInit(): void {
        const selectedMillis = this.$selectedMillis();
        if (selectedMillis) {
            this.workoutStore.fetchWorkouts(selectedMillis);
        }
    }

    onEditWorkout(workoutId: string) {
        this.router.navigate(['edit'], {
            relativeTo: this.route,
            queryParams: { id: workoutId },
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
            this.router.navigate(this.route.snapshot.url, {
                queryParams: { ...params, day: Number(params['day']) + delta },
            });
        }
    }

    onCalendarDatePicked(event: MatDatepickerInputEvent<DateTime>) {
        if (event.value) {
            console.log('val', event.value)
        }
    }

    tagSearchResults: string[] = [];
    onTagSearch(tagName: string) {
        const tags = ['alpha', 'bravo', 'charlie'];
        this.tagSearchResults = tags.filter((tag) => tag.includes(tagName));
    }

    chipList: string[] = [];
    onTagSelected(event: MatAutocompleteSelectedEvent) {
        this.chipList.push(event.option.value);
    }
}
