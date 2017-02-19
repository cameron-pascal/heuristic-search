import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Search, SearchResult, SearchType } from '../models/search.model';
import { Grid } from '../models/grid.model';
import { Cell } from '../models/cell.model';
import { GridManager } from '../models/gridManager.model';
import { RandomizedGridManager } from '../models/randomizedGridManager.model';
import { SerializedGridManager } from '../models/serializedGridManager.model';

@Injectable()
export class SearchManagerService {
    
    private _searches = new Array<SearchResult>();
    private _gridManagers = new Array<GridManager>();
    private _startAndGoalPairs = new Array<[Cell, Cell]>();
    private _currentSearchSource: BehaviorSubject<SearchResult>;
    private _currentGridManager: GridManager;
    private _currentStartAndGoalPair: [Cell, Cell];
    private _searchIndexMax: number;

    private readonly gridCount = 5;
    private readonly searchesPerGrid = 10;
    
    readonly searchIndexStart = 0;

    get currentSearch$() {
        return this._currentSearchSource;
    }

    initializeWithGeneratedGrids() {
        let avgLength = 0;
        let avgExpanded = 0;
        this._searchIndexMax  = (this.gridCount * this.searchesPerGrid) - 1;
        for (let i = 0; i < this.gridCount; i++) {
            const gridManager = new RandomizedGridManager();
            for (let j = 0; j < this.searchesPerGrid; j++) {
                this._gridManagers.push(gridManager);
                const startAndGoalPair = gridManager.getStartAndGoalCellPair();
                this._startAndGoalPairs.push(startAndGoalPair);
                const search = new Search(gridManager.grid, startAndGoalPair[0], startAndGoalPair[1]);
                const result = search.initiateSearch(SearchType.AStar, 1);
                 //avgLength = startAndGoalPair[1].g + avgLength;
                avgExpanded = result.expanded + avgExpanded;

                this._searches.push(result);
            }
        }
        avgLength = avgLength / 50;
        avgExpanded = avgExpanded / 50;

        this._currentGridManager = this._gridManagers[this.searchIndexStart];
        this._currentStartAndGoalPair = this._startAndGoalPairs[this.searchIndexStart];
        this._currentSearchSource = new BehaviorSubject<SearchResult>(this._searches[this.searchIndexStart]);
    }

    initializeWithSerializedGrid(data: string) {
        this._searchIndexMax = 0;
        const gridManager = new SerializedGridManager(data);
        this._gridManagers[0] = gridManager;
        this._currentGridManager = gridManager;
        const startAndGoalCells = gridManager.getStartAndGoalCellPair();
        this._startAndGoalPairs.push(startAndGoalCells);
        this._searches.push(new Search(gridManager.grid, startAndGoalCells[0], startAndGoalCells[1]).initiateSearch(SearchType.AStar, 1));
        
        this._currentGridManager = this._gridManagers[this.searchIndexStart];
        this._currentStartAndGoalPair = this._startAndGoalPairs[this.searchIndexStart];
        this._currentSearchSource = new BehaviorSubject<SearchResult>(this._searches[this.searchIndexStart]);
    }
    
    get searchIndexMax() {
      return this._searchIndexMax;
    }

    runNewSearch(type: SearchType, weight: number) {
        const gridManager = this._currentGridManager;
        const startAndGoalPair = this._currentStartAndGoalPair; 
        const newSearch = new Search(gridManager.grid, startAndGoalPair[0], startAndGoalPair[1]);
        const result = newSearch.initiateSearch(type, weight);
        this._currentSearchSource.next(result);
    }

    serializeCurrentSearchGrid() {
        const startAndGoalPair = this._currentStartAndGoalPair; 
        return this._currentGridManager.serialize(startAndGoalPair[0], startAndGoalPair[1]);
    }

    getCurrentCellSearchData(cell: Cell) {
        return this._currentSearchSource.getValue().getCellSearchData(cell);
    }

    setCurrentSearchResult(index: number) {
        this._currentGridManager = this._gridManagers[index];
        this._currentStartAndGoalPair = this._startAndGoalPairs[index];
        this._currentSearchSource.next(this._searches[index]);
    }
}