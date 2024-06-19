import {
    Component,
    OnDestroy,
    OnInit,
    Pipe,
    PipeTransform,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime, DateTimeFormatOptions } from 'luxon';
import { Tag, Workout } from '../../models/workout.model';
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
import { TypeaheadChipListComponent } from '../typeahead-search/typeahead-chip-list/typeahead-chip-list.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
        TypeaheadChipListComponent
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
    selectedWorkouts$!: Observable<Workout[]>;
    protected selectedMillis$ = new BehaviorSubject(0);

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
        this.selectedWorkouts$ = this.workoutStore.workouts$.pipe(
            map((workouts) =>
                workouts.filter((workout) => {
                    return (
                        DateTime.fromMillis(workout.instantMillis)
                            .startOf('day')
                            .toMillis() ==
                        DateTime.fromMillis(this.selectedMillis$.value)
                            .startOf('day')
                            .toMillis()
                    );
                })
            ),
            takeUntil(this.onDestroy$)
        );

        this.selectedMillis$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((millis) => this.workoutStore.fetchWorkouts(millis));

        this.route.queryParams.subscribe((params) => {
            this.selectedMillis$.next(
                DateTime.fromFormat(
                    params['day'] + params['month'] + params['year'],
                    'dMyyyy'
                ).toMillis()
            );
        });
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
        const params = this.route.snapshot.queryParams;
        const dt = DateTime.fromFormat(
            params['day'] + params['month'] + params['year'],
            'dMyyyy'
        )
        this.router.navigate(this.route.snapshot.url, {queryParams: { ...params, day: +params['day'] + delta }})
        // this.selectedMillis$.next(
        //     DateTime.fromMillis(this.selectedMillis$.value)
        //         .plus({ day: delta })
        //         .toMillis()
        // );
    }

    onCalendarDatePicked(event: MatDatepickerInputEvent<DateTime>) {
        if (event.value) {
            this.selectedMillis$.next(event.value.toMillis());
        }
    }

    tagSearchResults: string[] = [];
    onTagSearch(tagName: string) {
        const tags = ['alpha', 'bravo', 'charlie'];
        this.tagSearchResults = tags
            .filter(tag => tag.includes(tagName));

    }

    chipList: string[] = [];
    onTagSelected(event: MatAutocompleteSelectedEvent) {
        this.chipList.push(event.option.value);
    }
}
