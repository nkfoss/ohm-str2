import { Component, Input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-chip-list',
    standalone: true,
    imports: [MatChipsModule],
    templateUrl: './chip-list.component.html',
    styleUrl: './chip-list.component.scss',
})
export class ChipListComponent {
    @Input()
    chipItems: any[] | undefined = [];

    remove(index: number): void {
        if (index >= 0) {
            this.chipItems?.splice(index, 1);
        }
    }
}
