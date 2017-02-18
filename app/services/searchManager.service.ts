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
    private _gridManagers: { [index: number]: GridManager } = {};
    private _currentSearchSource: BehaviorSubject<SearchResult>;
    private _currentGridManager: GridManager;
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
        let count = 0;
        for (let i = 0; i < this.gridCount; i++) {
            const gridManager = new RandomizedGridManager();
            for (let j = 0; j < this.searchesPerGrid; j++) {
                this._gridManagers[count++] = gridManager;
                const startAndGoalPair = gridManager.getNewStartAndGoalCells();
                const search = new Search(gridManager.grid, startAndGoalPair[0], startAndGoalPair[1]);
                const result = search.initiateSearch(SearchType.WeightedAStar);
                 //avgLength = startAndGoalPair[1].g + avgLength;
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

    initializeWithSerializedGrid(data: string) {
        this._searchIndexMax = 0;
        const gridManager = new SerializedGridManager(data);
        this._gridManagers[0] = gridManager;
        this._currentGridManager = gridManager;
        this._searches.push(new Search(gridManager.grid, gridManager.startCell, gridManager.goalCell).initiateSearch(SearchType.WeightedAStar));
        this._currentSearchSource = new BehaviorSubject<SearchResult>(this._searches[this.searchIndexStart]);
    }
    
    get searchIndexMax() {
      return this._searchIndexMax;
    }

    serializeCurrentSearchGrid() {
        return this._currentGridManager.serialize();
    }

    getCurrentCellSearchData(cell: Cell) {
        return this._currentSearchSource.getValue().getCellSearchData(cell);
    }

    setCurrentSearchResult(index: number) {
        this._currentSearchSource.next(this._searches[index]);
        this._currentGridManager = this._gridManagers[index];
    }
}