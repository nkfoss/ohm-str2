import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { getProp } from '../../util/object.util';

export interface ChipListItemWrapper {
    color: string;
    item: any;
}

@Component({
    selector: 'app-chip-list',
    standalone: true,
    imports: [MatChipsModule, MatIconModule],
    templateUrl: './chip-list.component.html',
    styleUrl: './chip-list.component.scss',
})
export class ChipListComponent {

    @Input()
    chipItems: ChipListItemWrapper[] | undefined = [];

    @Input()
    displayValuePropertyPath: string = '';

    @Output()
    chipRemoved: EventEmitter<number> = new EventEmitter();

    getProp(chip: any, path: string) {
        return getProp(chip, path)
    }
}
