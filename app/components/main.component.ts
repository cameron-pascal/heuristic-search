import { Component } from '@angular/core';
import { Grid } from '../models/grid.model';
import { GridManager } from '../models/gridManager.model';
import { Cell } from '../models/cell.model';
import { search } from '../models/search/astar.model';
import { BinaryMinHeap } from '../models/binaryMinHeap.model';
import { searchType } from '../models/search/astar.model';

@Component({
  selector: 'main-container',
  templateUrl: './app/templates/main.component.html',
  styles: [`
    arrow-button 
    {
      height: 25px; 
      width: 25px; 
      display: inline-block 
    }
  `]
})

export class MainComponent  {
  
  private readonly gridWidth = 160;
  private readonly gridLength = 120;

  grid: Grid;
  startAndGoalCells: [Cell, Cell];
  path: Array<Cell>;

  constructor() {
    this.grid = new Grid(this.gridLength, this.gridWidth);
    let gridManager = new GridManager(this.grid);
    //console.log(this.grid.serialize());
    this.startAndGoalCells = gridManager.getNewStartAndGoalCells();
    let s = new search(this.grid, this.startAndGoalCells[0], this.startAndGoalCells[1]);
    this.path = s.initiateSearch(searchType.Astar);
    console.log();
  } 
   
   pageLeft(data: string) {
     console.log("left");
   }

   pageRight(data: string) {
     console.log("right");
   }
}
