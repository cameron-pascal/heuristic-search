import { Component } from '@angular/core';

@Component({
  selector: 'main-container',
  templateUrl: './app/templates/main.component.html',
  styles: ['arrow-button { height: 25px; width: 25px; display: inline-block }']
})

export class MainComponent  { 
   
   pageLeft(data: string) {
     console.log("left");
   }

   pageRight(data: string) {
     console.log("right");
   }
}
