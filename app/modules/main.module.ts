import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MainComponent }  from '../components/main.component';
import { ArrowButtonComponent } from '../components/arrowButton.component';
import { RangeInputBoxComponent } from '../components/rangeInputBox.component';
import { GridComponent } from '../components/grid.component';

import { RotationDirective } from '../directives/rotationAngle.directive';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MainComponent, ArrowButtonComponent, RangeInputBoxComponent, RotationDirective, GridComponent ],
  bootstrap:    [ MainComponent ]
})

export class MainModule { 

}
