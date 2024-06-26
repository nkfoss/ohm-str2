import { ENTER } from '@angular/cdk/keycodes';
import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewChild,
} from '@angular/core';
import {
    MatChipInputEvent,
    MatChipsModule,
} from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TypeaheadSearchComponent } from '../typeahead-search.component';
import {
    MatAutocompleteModule,
    MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
    Subject,
    Subscription,
    debounceTime,
    filter,
    fromEvent,
    takeUntil,
} from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { ChipListComponent } from '../../chip-list/chip-list.component';

@Component({
    selector: 'app-typeahead-chip-list',
    standalone: true,
    templateUrl: './typeahead-chip-list.component.html',
    styleUrl: './typeahead-chip-list.component.scss',
    imports: [
        TypeaheadSearchComponent,
        ChipListComponent,
        MatFormFieldModule,
        MatChipsModule,
        MatIconModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        MatInputModule
    ],
})
export class TypeaheadChipListComponent implements AfterViewInit, OnDestroy {
    @Input()
    placeholder: string = 'Type to search...';

    @Input()
    searchResults: any[] = [];

    @Input()
    chipItems: any[] | undefined = [];

    @Input()
    disabled: boolean = false;

    @Input()
    minCharsToSearch: number = 0;

    @Input()
    resultValuePropertyPath: string = '';

    @Input()
    resultDisplayPropertyPath: string = '';

    @Input()
    valueFormCtl: FormControl = new FormControl();

    @Input()
    displayFormCtl: FormControl = new FormControl();

    @Output()
    search: EventEmitter<string> = new EventEmitter();

    @Output()
    resultSelection: EventEmitter<MatAutocompleteSelectedEvent> =
        new EventEmitter();

    @Output()
    clearForm: EventEmitter<any> = new EventEmitter();

    @ViewChild('searchInput')
    searchElement!: ElementRef<HTMLInputElement>;

    searchKeyUp!: Subscription;

    addOnBlur = true;
    readonly separatorKeysCodes = [ENTER] as const;

    private onDestroy$ = new Subject<void>();
    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    ngAfterViewInit(): void {
        this.searchKeyUp = fromEvent(this.searchElement.nativeElement, 'keyup')
            .pipe(
                filter(
                    (results) =>
                        (results.target as HTMLInputElement).value.length >=
                        this.minCharsToSearch
                ),
                debounceTime(300),
                takeUntil(this.onDestroy$)
            )
            .subscribe((results) => {
                const input = results.target as HTMLInputElement;
                if (input.value !== '') {
                    this.search.emit(input.value);
                } else {
                    this.clearForm.emit();
                    this.searchResults = [];
                }
            });
    }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our item
        if (value) {
            this.chipItems?.push({ name: value });
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    remove(index: number): void {
        if (index >= 0) {
            this.chipItems?.splice(index, 1);
        }
    }

    onResultSelection(event: MatAutocompleteSelectedEvent) {
        this.valueFormCtl.reset();
        this.displayFormCtl.reset();
        this.resultSelection.emit(event);
    }

    getProp = (obj: any, path: string) =>
        path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
