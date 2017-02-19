import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchType } from '../models/search.model';
import { SearchManagerService } from '../services/searchManager.service';


class SearchOption {
    
    constructor(public readonly value: SearchType, public readonly display: string) {}
}

class SearchSelectionModel {

    constructor(public selectedSearchOption: SearchOption, public weight: number = 1) { }
}

@Component({
    selector: 'search-selector',
    templateUrl: './app/templates/searchSelector.component.html'
})
export class SearchSelectorComponent implements OnInit {

    public readonly availableSearchOptions = [
        new SearchOption(SearchType.AStar, 'A*'),
        new SearchOption(SearchType.WeightedAStar, 'Weighted A*'),
        new SearchOption(SearchType.Uniformed, 'UCS'),
        new SearchOption(SearchType.SequentialHeuristic, 'Sequential Heuristic')
    ];

    public selectedSearch: SearchSelectionModel

    public get showWeightBox() {
        return this.selectedSearch.selectedSearchOption.value === SearchType.WeightedAStar;
    }

    constructor(private readonly searchManager: SearchManagerService) { }

    ngOnInit() { 
       this.selectedSearch = new SearchSelectionModel(this.availableSearchOptions[0], 1);
    }

    searchSelectionChanged(searchOption: SearchOption) {
        this.selectedSearch.selectedSearchOption = searchOption;
    }

    updateWeight(val: number) {
        this.selectedSearch.weight = Number(val);
    }

    runSearch() {
        this.searchManager.runNewSearch(this.selectedSearch.selectedSearchOption.value, this.selectedSearch.weight);
    }
}