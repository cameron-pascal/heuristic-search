import { Component } from '@angular/core';
import { Grid } from '../models/grid.model';
import { GridInitializer } from '../models/gridInitializer.model';
import { Cell } from '../models/cell.model';

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
  
  constructor() {
    this.grid = new Grid(this.gridLength, this.gridWidth);
    let gridInitializer = new GridInitializer(this.grid);
    console.log(this.grid.serialize());
    this.startAndGoalCells = gridInitializer.getNewStartAndGoalCells()
    console.log();
  } 
   
   pageLeft(data: string) {
     console.log("left");
   }

   pageRight(data: string) {
     console.log("right");
   }
}
