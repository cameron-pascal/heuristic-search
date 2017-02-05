import { Component, OnInit } from '@angular/core';
import { SearchResult } from '../models/search.model';
import { SearchManagerService } from '../services/searchManager.service';
import { Cell } from '../models/cell.model';


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

  private _currentCell: Cell;
  
  get currentCell() {
    return this._currentCell;
  }

  set currentCell(val: Cell) {
    this._currentCell = val;
  }
}
