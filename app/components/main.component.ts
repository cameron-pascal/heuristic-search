import { Component, OnInit } from '@angular/core';
import { SearchResult } from '../models/search.model';
import { SearchManagerService } from '../services/searchManager.service';


@Component({
  selector: 'main-container',
  templateUrl: './app/templates/main.component.html',
  providers: [SearchManagerService],
  styles: []
})

export class MainComponent {

}
