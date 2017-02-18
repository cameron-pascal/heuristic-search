import { Component, OnInit } from '@angular/core';
import { SearchResult, CellSearchData } from '../models/search.model';
import { SearchManagerService } from '../services/searchManager.service';


@Component({
  selector: 'main-container',
  templateUrl: './app/templates/main.component.html',
  providers: [SearchManagerService],
  styles: [`
    #header {
      display: inline-block;
      margin-bottom: 10px;
    }
  `]
})

export class MainComponent {
  
  private _currentCellData: CellSearchData;
  
  get currentCellData() {
    return this._currentCellData;
  }

  set currentCellData(val: CellSearchData) {
    this._currentCellData = val;
  }
}
