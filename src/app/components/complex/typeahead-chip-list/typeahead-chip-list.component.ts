import {
    Component,
    EventEmitter,
    Input,
    Output,
    Pipe,
    PipeTransform,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TypeaheadResult, TypeaheadSearchComponent } from '../../typeahead-search/typeahead-search.component';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ChipListComponent, ChipListItemWrapper } from '../../chip-list/chip-list.component';

@Pipe({ name: 'typeaheadChipListResult', standalone: true })
export class TypeaheadChiplistResultPipe implements PipeTransform {
    transform(searchResults: any[], chipItems: ChipListItemWrapper[]): TypeaheadResult[] {
        return searchResults.map(result => {
            return {
                disabled: chipItems.map(chipItem => chipItem.item).includes(result),
                result: result
            }
        })
    }
}

@Component({
    selector: 'app-typeahead-chip-list',
    standalone: true,
    templateUrl: './typeahead-chip-list.component.html',
    styleUrl: './typeahead-chip-list.component.scss',
    imports: [
        ChipListComponent,
        TypeaheadSearchComponent,
        MatAutocompleteModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        TypeaheadChiplistResultPipe
    ],
})
export class TypeaheadChipListComponent {
    @Input()
    placeholder: string = 'Type to search...';

    @Input()
    searchResults: any[] = [];

    @Input()
    chipItems: ChipListItemWrapper[] = [];

    @Input()
    disabled: boolean = false;

    @Input()
    minCharsToSearch: number = 0;

    @Input()
    typeaheadValuePropertyPath: string = '';

    @Input()
    typeaheadDisplayPropertyPath: string = '';

    @Input()
    chipDisplayPropertyPath: string = '';

    @Input()
    typeaheadValueFormCtl: FormControl = new FormControl();

    @Input()
    typeaheadDisplayFormCtl: FormControl = new FormControl();

    @Output()
    search: EventEmitter<string> = new EventEmitter();

    @Output()
    resultSelection: EventEmitter<MatAutocompleteSelectedEvent> =
        new EventEmitter();

    @Output()
    clearForm: EventEmitter<any> = new EventEmitter();

    @Output()
    typeaheadSubmit: EventEmitter<string> = new EventEmitter();

    @Output()
    chipRemoved: EventEmitter<number> = new EventEmitter();

}
