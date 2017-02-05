import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SearchManagerService } from '../services/searchManager.service';

@Component({
    selector: 'index-selector',
    templateUrl: '../app/templates/indexSelector.component.html',
    styles: [`
        arrow-button {
            height: 25px; 
            width: 25px; 
            display: inline-block 
        }
    `]
})
export class IndexSelectorComponent implements OnInit {

    private _currentIndex: number;

    indexMin: number;
    indexMax: number;

    @Output() currentIndexChange = new EventEmitter<number>();

    constructor(private readonly searchManager: SearchManagerService) { 
        this.indexMin = searchManager.searchIndexStart + 1;
        this.indexMax = searchManager.searchIndexMax + 1;
    }

    set currentIndex(val: number) {
        this._currentIndex = val;
        this.currentIndexChange.emit(val);
        this.searchManager.setCurrentSearchResult(val - 1);
    }

    @Input() get currentIndex() {
        return this._currentIndex;
    }

    increment() {
        if (this.currentIndex < this.indexMax) {
            this.currentIndex++;
        }
    }

    decrement() {
        if (this.currentIndex > this.indexMin) {
            this.currentIndex--;
        }
    }

    ngOnInit() { 
        this.currentIndex = this.indexMin;
    }
}