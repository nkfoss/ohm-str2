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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    Subject,
    Subscription,
    debounceTime,
    filter,
    fromEvent,
    takeUntil,
} from 'rxjs';
import { getProp } from '../../util/object.util';

export interface TypeaheadResult {
    disabled: boolean;
    result: any;
}
@Component({
    selector: 'app-typeahead-search',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, ReactiveFormsModule],
    templateUrl: './typeahead-search.component.html',
    styleUrl: './typeahead-search.component.scss',
})
export class TypeaheadSearchComponent implements AfterViewInit, OnDestroy {
    @Input()
    placeholder: string = 'Type to search...';

    @Input()
    searchResults: TypeaheadResult[] = [];

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
    typeaheadSubmit: EventEmitter<string> = new EventEmitter();

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

    private onDestroy$ = new Subject<void>();
    ngOnDestroy(): void {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    onTypeaheadSubmit() {
        this.typeaheadSubmit.emit(this.displayFormCtl.value);
    }

    ngAfterViewInit(): void {
        this.searchKeyUp = fromEvent(this.searchElement.nativeElement, 'keyup')
            .pipe(
                filter(
                    (results) =>
                        (results.target as HTMLInputElement).value.length >=
                        this.minCharsToSearch
                ),
                debounceTime(100),
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

    onResultSelection(event: MatAutocompleteSelectedEvent) {
        this.valueFormCtl.setValue(event.option.value);
        this.displayFormCtl.setValue(event.option.value);
        this.resultSelection.emit(event);
    }

    getProp = (obj: any, path: string) => getProp(obj, path);
}
