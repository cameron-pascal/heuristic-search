import { Component } from '@angular/core';
import { Grid } from '../models/grid.model';
import { GridManager } from '../models/gridManager.model';
import { Cell } from '../models/cell.model';
import { search } from '../models/search/astar.model';
<<<<<<< HEAD
import { BinaryMinHeap } from '../models/binaryMinHeap.model';
=======
>>>>>>> 09f14f3e6dbc6bbee90a616ceb7584036469a78e

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
<<<<<<< HEAD
    //console.log(this.grid.serialize());
    this.startAndGoalCells = gridManager.getNewStartAndGoalCells();
    //let s = new search(this.grid, this.startAndGoalCells[0], this.startAndGoalCells[1]);
    //this.path = s.initiateSearch();
    console.log(this.startAndGoalCells[0]);
    console.log(this.startAndGoalCells[0].printCosts());
    //console.log(this.startAndGoalCells[1]);
    const heap = this.startAndGoalCells[0].neighborPriorityQueue;
    heap.push(new Cell(8008135), 5);
    heap.push(new Cell(8008136), 0.000000000000001);
    console.log(heap);

    while(heap.count > 0) {
      console.log(heap.pop());
    }
    console.log(this.grid.serialize());
    this.startAndGoalCells = gridManager.getNewStartAndGoalCells();
    let s = new search(this.grid, this.startAndGoalCells[0], this.startAndGoalCells[1]);
    this.path = s.initiateSearch();
    console.log();
  } 
   
   pageLeft(data: string) {
     console.log("left");
   }

   pageRight(data: string) {
     console.log("right");
   }
}
