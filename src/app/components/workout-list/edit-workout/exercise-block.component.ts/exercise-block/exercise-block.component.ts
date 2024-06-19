import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { ExerciseBlock, ExerciseSet } from '../../../../../models/workout.model';
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

export interface ExerciseBlockViewModel {
    exerciseName: string;
}
@Component({
    selector: 'app-exercise-block',
    standalone: true,
    imports: [
        MatTableModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
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
    exerciseName = '';

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
                    const name = exercises.find(
                        (ex) => ex.id === this.exerciseBlock.exerciseId
                    )?.name;
                    this.exerciseName = name ?? 'unknown';
                });
            this.dataSource = this.exerciseBlock.sets;
        }
    }

    onAddSet() {
        const dialogRef = this.dialog.open<EditSetDialogComponent, ExerciseSet, ExerciseSet>(
            EditSetDialogComponent,
            { data: {} }
        );
        dialogRef
            .afterClosed()
            .pipe(filterNullish())
            .subscribe((set: ExerciseSet) => {
                this.exerciseBlock.sets.push(set);
                this.dataSource = [...this.exerciseBlock.sets];
            });
    }

    onEditSet(index: number) {
        const selected = { ...this.exerciseBlock.sets.at(index) };
        const dialogRef = this.dialog.open<EditSetDialogComponent, ExerciseSet, ExerciseSet>(
            EditSetDialogComponent,
            {
                data: selected,
            }
        );
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
