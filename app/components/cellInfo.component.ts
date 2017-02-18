import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CellSearchData } from '../models/search.model'

@Component({
    selector: 'cell-info',
    templateUrl: './app/templates/cellInfo.component.html'
})
export class CellInfoComponent {

    @Input() cellData: CellSearchData;
    @Output() cellDataChange = new EventEmitter<CellSearchData>(); 
    
    constructor() { }
}