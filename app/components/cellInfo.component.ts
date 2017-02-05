import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Cell } from '../models/cell.model';

@Component({
    selector: 'cell-info',
    templateUrl: './app/templates/cellInfo.component.html'
})
export class CellInfoComponent {

    @Input() cell: Cell;
    @Output() cellChange = new EventEmitter<Cell>(); 
    
    constructor() { }
}