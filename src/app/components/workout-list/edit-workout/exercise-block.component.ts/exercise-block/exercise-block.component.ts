import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    Exercise,
    ExerciseBlock,
    ExerciseSet,
} from '../../../../../models/workout.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { EditSetDialogComponent } from '../../../../dialogs/edit-set-dialog/edit-set-dialog.component';
import { filterNullish } from '../../../../../util/filterNullish';
import { take } from 'rxjs';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '../../../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { ExerciseStore } from '../../../../../store/exercise.store';
import { MatMenuModule } from '@angular/material/menu';
import { ExerciseHistoryComponent } from '../../../../exercise-history/exercise-history.component';

export interface ExerciseBlockViewModel {
    exerciseName: string;
}
@Component({
    selector: 'app-exercise-block',
    standalone: true,
    imports: [
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
    ],
    templateUrl: './exercise-block.component.html',
    styleUrl: './exercise-block.component.scss',
})
export class ExerciseBlockComponent implements OnChanges {
    constructor(
        private exerciseStore: ExerciseStore,
        public dialog: MatDialog
    ) {}
    @Input()
    exerciseBlock!: ExerciseBlock;
    exercise: Exercise | undefined;

    displayedColumns: string[] = ['weight', 'reps', 'actions'];

    dataSource: ExerciseSet[] = [];

    selection = new SelectionModel<ExerciseSet>(true, []);

    @Output()
    deleteBlock = new EventEmitter<string>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['exerciseBlock']) {
            this.exerciseStore.exercises$
                .pipe(take(1))
                .subscribe((exercises) => {
                    this.exercise = exercises.find(
                        (ex) => ex.id === this.exerciseBlock.exerciseId
                    );
                });
            this.dataSource = this.exerciseBlock.sets ?? [];
        }
    }

    onOpenHistory() {
        this.dialog.open<ExerciseHistoryComponent, Exercise, void>(
            ExerciseHistoryComponent,
            {
                data: this.exercise,
            }
        );
    }

    onAddSet() {
        const dialogRef = this.dialog.open<
            EditSetDialogComponent,
            ExerciseSet,
            ExerciseSet
        >(EditSetDialogComponent, {
            data: {},
            position: {
                top: `${window.innerHeight / 5}px`,
            },
        });
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((set: ExerciseSet) => {
                if (!this.exerciseBlock.sets) {
                    this.exerciseBlock.sets = [];
                }
                this.exerciseBlock.sets.push(set);
                this.dataSource = [...this.exerciseBlock.sets];
            });
    }

    onCopySet(index: number) {
        const curr = this.exerciseBlock.sets.at(index);
        if (curr) {
            this.exerciseBlock.sets.push({ ...curr });
            this.dataSource = [...this.exerciseBlock.sets];
        }
    }

    onEditSet(index: number) {
        const selected = { ...this.exerciseBlock.sets.at(index) };
        const dialogRef = this.dialog.open<
            EditSetDialogComponent,
            ExerciseSet,
            ExerciseSet
        >(EditSetDialogComponent, {
            data: selected,
            position: {
                top: `${window.innerHeight / 5}px`,
            },
        });
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((set: ExerciseSet) => {
                this.exerciseBlock.sets[index] = set;
                this.dataSource = [...this.exerciseBlock.sets];
            });
    }

    onDeleteSet(index: number) {
        this.exerciseBlock.sets.splice(index, 1);
        this.dataSource = [...this.exerciseBlock.sets];
    }

    onDeleteBlock() {
        const dialogRef = this.dialog.open<
            ConfirmationDialogComponent,
            ConfirmationDialogData
        >(ConfirmationDialogComponent, {
            data: {
                message: 'Are you sure you want to delete this block?',
                confirmButtonColor: 'warn',
            },
        });
        dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
                this.deleteBlock.emit(this.exerciseBlock.id);
            }
        });
    }
}
