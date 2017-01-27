import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MainComponent }  from '../components/main.component';
import { ArrowButtonComponent } from '../components/arrowButton.component';

import { RotationDirective } from '../directives/rotationAngle.directive';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ MainComponent, ArrowButtonComponent, RotationDirective ],
  bootstrap:    [ MainComponent ]
})
export class MainModule { 

}
