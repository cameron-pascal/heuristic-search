import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { SearchResult, CellSearchData } from '../models/search.model';
import { SearchManagerService } from '../services/searchManager.service';


@Component({
  selector: 'main-container',
  templateUrl: './app/templates/main.component.html',
  styles: [`
    #header {
      display: inline-block;
      margin-bottom: 10px;
    }
  `]
})

export class MainComponent {

  private _currentCellData: CellSearchData;

  @ViewChild('headerBox') headerDiv: ElementRef;

  constructor(private readonly searchManager: SearchManagerService, private readonly renderer: Renderer) {}
  
  get currentCellData() {
    return this._currentCellData;
  }

  set currentCellData(val: CellSearchData) {
    this._currentCellData = val;
  }

  save() {
    const data = this.searchManager.serializeCurrentSearchGrid();
    
    const buf = new ArrayBuffer(data.length);
    const bufView = new Uint8Array(buf);

    for (let i=0; i<data.length; i++) {
      bufView[i] = data.charCodeAt(i);
    }

    const blob = new Blob([buf], { type: 'text/plain'});
    const encodedDataUrl = URL.createObjectURL(blob);
    let downloadLink = this.renderer.createElement(this.headerDiv.nativeElement, 'a');
    this.renderer.setElementAttribute(downloadLink, 'href', encodedDataUrl);
    this.renderer.setElementAttribute(downloadLink, 'download', 'grid.txt');
    this.renderer.invokeElementMethod(downloadLink, 'click');
    this.renderer.invokeElementMethod(downloadLink, 'remove');
  }
}
