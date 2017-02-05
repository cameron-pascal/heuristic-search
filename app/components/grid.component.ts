import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Grid } from '../models/grid.model';
import { Cell, CellType } from '../models/cell.model';
import { SearchResult } from '../models/search.model';
import { SearchManagerService } from '../services/searchManager.service';

@Component({
    selector: 'grid',
    templateUrl: './app/templates/grid.component.html'
    /*styles: [`
        canvas {
            height: 2800px;
            width: 3200px;
        }
    `]*/
})
export class GridComponent implements OnInit {
    
    @ViewChild('displayCanvas') displayCanvas: ElementRef;

    @Output() cellClicked: EventEmitter<Cell>;

    private readonly cellDimensions = [10, 10];
    private readonly gridLineColor = "#000000";
    private readonly unblockedColor = "#FFFFFF";
    private readonly partiallyBlockedColor = "#D3D3D3";
    private readonly fullyBlockedColor = "#000000";
    private readonly fastUnblockedColor = "#30819C";
    private readonly fastPartiallyBlockedColor = "#79A6B5";
    private readonly startColor = "#66CD00"
    private readonly endColor = "#B74C4C";

    private searchResult: SearchResult;

    constructor(private readonly searchManager: SearchManagerService) { }

    ngOnInit() {
        const canvas = this.displayCanvas.nativeElement as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        this.searchManager.currentSearch$.subscribe(searchResult => {
            this.searchResult = searchResult;
            context.clearRect(0, 0, this.displayCanvas.nativeElement.width, this.displayCanvas.nativeElement.height);
            this.draw(searchResult, context);
        });
    }

    gridClicked(x: number, y: number) {
        const col = Math.floor(x / this.cellDimensions[0]);
        const row = Math.floor(y / this.cellDimensions[1]);

        const cell = this.searchResult.grid.getCell(row, col);

        this.cellClicked.emit(cell);
    }

    private draw(searchResult: SearchResult, context: CanvasRenderingContext2D) {
        
        const cellWidth = this.cellDimensions[1];
        const cellHeight = this.cellDimensions[0];

        context.lineWidth = 1;
        context.strokeStyle = this.gridLineColor;
        
        for(let row = 0; row < searchResult.grid.length; row++) {
            for (let col = 0; col < searchResult.grid.width; col++) {
                const cell = searchResult.grid.getCell(row, col);
                
                const x = col * cellWidth;
                const y = row * cellHeight;

                context.beginPath();
                context.rect(x, y, cellWidth, cellHeight);

                if (searchResult.path.indexOf(cell) >= 0) {
                    context.fillStyle = 'violet';
                    if (cell.isFast) {
                        context.fillStyle = 'yellow';
                    }
                } else if (cell.id === searchResult.startAndGoalCells[0].id) {
                    context.fillStyle = this.startColor;
                } else if (cell.id === searchResult.startAndGoalCells[1].id) {
                    context.fillStyle = this.endColor;
                } else if (cell.cellType === CellType.PartiallyBlocked) {
                    if (cell.isFast) {
                        context.fillStyle = this.fastPartiallyBlockedColor;
                    } else {
                        context.fillStyle = this.partiallyBlockedColor;
                    }
                } else if (cell.cellType === CellType.Unblocked) {
                    if (cell.isFast) {
                        context.fillStyle = this.fastUnblockedColor;
                    } else {
                        context.fillStyle = this.unblockedColor;
                    }
                } else {
                    context.fillStyle = this.fullyBlockedColor;
                }

                context.fill();
                context.stroke();
                context.closePath();
            }
        }
    }
}