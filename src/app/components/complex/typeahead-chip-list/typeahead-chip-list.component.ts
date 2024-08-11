import {
    Component,
    EventEmitter,
    Input,
    Output,
    computed,
    input,
} from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TypeaheadSearchComponent } from '../../typeahead-search/typeahead-search.component';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import {
    ChipListComponent,
    ChipListItemWrapper,
} from '../../chip-list/chip-list.component';

@Component({
    selector: 'app-typeahead-chip-list',
    standalone: true,
    templateUrl: './typeahead-chip-list.component.html',
    styleUrl: './typeahead-chip-list.component.scss',
    imports: [
        ChipListComponent,
        MatAutocompleteModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        ReactiveFormsModule,
        TypeaheadSearchComponent,
    ],
})
export class TypeaheadChipListComponent {
    @Input()
    placeholder: string = 'Type to search...';

    $searchResults = input.required<any[]>();
    $chipItems = input.required<ChipListItemWrapper[]>();
    $chipListResults = computed(() => {
        return this.$searchResults().map((result) => {
            return {
                disabled: this.$chipItems()
                    .map((chipItem) => chipItem.item)
                    .includes(result),
                result: result,
            };
        });
    });

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
