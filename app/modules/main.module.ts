import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MainComponent }  from '../components/main.component';
import { ArrowButtonComponent } from '../components/arrowButton.component';
import { IndexSelectorComponent } from '../components/indexSelector.component';
import { RangeInputBoxComponent } from '../components/rangeInputBox.component';
import { GridComponent } from '../components/grid.component';
import { CellInfoComponent } from '../components/cellInfo.component';

import { RotationDirective } from '../directives/rotationAngle.directive';

@NgModule({
  imports:      [ BrowserModule, FormsModule ],
  declarations: [ MainComponent, ArrowButtonComponent, IndexSelectorComponent, CellInfoComponent, RangeInputBoxComponent, RotationDirective, GridComponent ],
  bootstrap:    [ MainComponent ]
})

export class MainModule { 

}
