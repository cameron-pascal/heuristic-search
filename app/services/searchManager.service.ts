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
    private readonly searchesPerGrid = 10;
    
    readonly searchIndexStart = 0;

    get currentSearch$() {
        return this._currentSearchSource;
    }

    constructor() {
        let avgLength = 0;
        let avgExpanded = 0;
        this._searchIndexMax  = (this.gridCount * this.searchesPerGrid) - 1;
        for (let i = 0; i < this.gridCount; i++) {
            const grid = new Grid(this.gridLength, this.gridWidth);
            const gridManager = new GridManager(grid);
            for (let j = 0; j < this.searchesPerGrid; j++) {
                 const grid = new Grid(this.gridLength, this.gridWidth);
                 const gridManager = new GridManager(grid);
                 const startAndGoalPair = gridManager.getNewStartAndGoalCells();
                 const search = new Search(grid, startAndGoalPair[0], startAndGoalPair[1]);
                 const result = search.initiateSearch(SearchType.AStar);
                     avgLength = result.length + avgLength;
                    avgExpanded = result.expanded + avgExpanded;

                    this._searches.push(result);
                /*for (let x = 0; x < 3; x++){
                    let type = SearchType.Uniformed;
                    if(x == 0){
                        type = SearchType.Uniformed;
                    } else if (x == 1){
                        type = SearchType.AStar;
                    } else if (x == 2){
                        type = SearchType.AStar;
                    } 
                    const result = search.initiateSearch(type);
                    gridManager.gridRestart(grid);
                    this._searches.push(result);
                    }*/
            }
        }
        avgLength = avgLength / 50;
        avgExpanded = avgExpanded / 50;
        this._currentSearchSource = new BehaviorSubject<SearchResult>(this._searches[this.searchIndexStart]);
    }
    
    get searchIndexMax() {
      return this._searchIndexMax;
    }

    setCurrentSearchResult(index: number) {
        this._currentSearchSource.next(this._searches[index]);
    }
}