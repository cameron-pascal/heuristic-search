import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MainComponent }  from '../components/main.component';
import { ArrowButtonComponent } from '../components/arrowButton.component';
import { RangeInputBoxComponent } from '../components/rangeInputBox.component';

import { RotationDirective } from '../directives/rotationAngle.directive';

import { Grid } from '../models/grid.model';
import { GridInitializer } from '../models/gridInitializer.model';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MainComponent, ArrowButtonComponent, RangeInputBoxComponent, RotationDirective ],
  bootstrap:    [ MainComponent ]
})

export class MainModule { 

  private readonly gridWidth = 160;
  private readonly gridLength = 120;

  constructor() {
    let grid = new Grid(this.gridLength, this.gridWidth);
    let gridInitializer = new GridInitializer(grid);
  }
}
