import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Search, SearchResult, SearchType } from '../models/search.model';
import { Grid } from '../models/grid.model';
import { GridManager } from '../models/gridManager.model';

@Injectable()
export class SearchManagerService {
    
    private _searches = new Array<SearchResult>();
    private _currentSearchSource: BehaviorSubject<SearchResult>;
    private _searchIndexMax: number;

    private readonly gridWidth = 160;
    private readonly gridLength = 120;
    private readonly gridCount = 5;
    private readonly searchesPerGrid = 1;
    
    readonly searchIndexStart = 0;

    get currentSearch$() {
        return this._currentSearchSource;
    }

    constructor() {
        this._searchIndexMax  = (this.gridCount * this.searchesPerGrid) - 1;
        for (let i = 0; i < this.gridCount; i++) {
            const grid = new Grid(this.gridLength, this.gridWidth);
            const gridManager = new GridManager(grid);
            for (let j = 0; j < this.searchesPerGrid; j++) {
                console.log("running search");
                const startAndGoalPair = gridManager.getNewStartAndGoalCells();
                const search = new Search(grid, startAndGoalPair[0], startAndGoalPair[1]);
                const result = search.initiateSearch(SearchType.AStar);
                this._searches.push(result);
            }
        }

        this._currentSearchSource = new BehaviorSubject<SearchResult>(this._searches[this.searchIndexStart]);
    }
    
    get searchIndexMax() {
      return this._searchIndexMax;
    }

    setCurrentSearchResult(index: number) {
        console.log('set to ' + index);
        this._currentSearchSource.next(this._searches[index]);
    }
}