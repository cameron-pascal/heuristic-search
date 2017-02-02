import { Component, OnInit, ElementRef, ViewChild, Input, Renderer } from '@angular/core';
import { Grid } from '../models/grid.model';
import { Cell, CellType } from '../models/cell.model';

@Component({
    selector: 'grid',
    templateUrl: './app/templates/grid.component.html',
    /*styles: [`
        canvas {
            height: 2800px;
            width: 3200px;
        }
    `]*/
})
export class GridComponent implements OnInit {
    
    @ViewChild('displayCanvas') displayCanvas: ElementRef;
    @ViewChild('hitCanvas') hitCanvas: ElementRef;
    
    @Input() gridModel: Grid;
    @Input() startAndGoalCellIds: [number, number];
    @Input() path: Array<Cell>;

    private cellMap: Array<Cell>;

    private readonly cellDimensions = [20, 20];
    private readonly gridLineColor = "#000000";
    private readonly unblockedColor = "#FFFFFF";
    private readonly partiallyBlockedColor = "#D3D3D3";
    private readonly fullyBlockedColor = "#000000";
    private readonly fastUnblockedColor = "#30819C";
    private readonly fastPartiallyBlockedColor = "#79A6B5";
    private readonly startColor = "#66CD00"
    private readonly endColor = "#B74C4C";

    constructor(renderer: Renderer) { }

    ngOnInit() {
        let cells = this.gridModel.getAllCells();
        this.cellMap = this.createCellMap(cells);
        
        let canvas = this.displayCanvas.nativeElement as HTMLCanvasElement;
        let context = canvas.getContext('2d');

        this.draw(cells, context, this.path);
    }

    gridClicked(x: number, y: number) {
        let col = Math.floor(x / this.cellDimensions[0]);
        let row = Math.floor(y / this.cellDimensions[1]);
        console.log("cell " + [row, col] +": ", this.gridModel.getCell(row, col));
    }

    private draw(cells: Array<Array<Cell>>, context: CanvasRenderingContext2D, path: Array<Cell>) {
        
        let cellWidth = this.cellDimensions[1];
        let cellHeight = this.cellDimensions[0];

        context.lineWidth = 1;
        context.strokeStyle = this.gridLineColor;
        
        for(let row=0; row<cells.length; row++) {
            let colWidth = cells[row].length;
            for (let col=0; col<colWidth; col++) {
                let cell = cells[row][col];
                
                let x = col * cellWidth;
                let y = row * cellHeight;

                context.beginPath();
                context.rect(x, y, cellWidth, cellHeight);

                if (path.indexOf(cell) >= 0) {
                    context.fillStyle = 'brown';
                    if (cell.isFast) {
                        context.fillStyle = 'yellow';
                    }
                } else if (cell.id === this.startAndGoalCellIds[0]) {
                    context.fillStyle = this.startColor;
                } else if (cell.id === this.startAndGoalCellIds[1]) {
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

    private createCellMap(cells: Array<Array<Cell>>) {
        let map = new Array<Cell>();
        for(let i=0; i<cells.length; i++) {
            let colWidth = cells[i].length;
            for (let j=0; j<colWidth; j++) {
                map.push(cells[i][j]);
            }
        }

        return map;
    }
}