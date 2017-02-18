import { GridManager } from './gridManager.model';
import { Grid } from './grid.model';
import { Cell } from './cell.model';

export class SerializedGridManager extends GridManager {

    private _startCell: Cell;
    private _goalCell: Cell;

    protected get startCell() {
        return this._startCell;
    }

    protected get goalCell() {
        return this._goalCell;
    }

    constructor(data: string) {
        const rows = data.split('\r\n');
        super(new Grid(rows.splice(GridManager.hardRegionCount)), rows.splice(0, GridManager.hardRegionCount - 1));
    }

    protected initializeGrid(initializationData: Array<string>) {
        this._startCell = this.extractCell(initializationData[0].trim());
        this._goalCell = this.extractCell(initializationData[1].trim());

        this.hardRegionCenters = new Array<Cell>();
        for (let i=0; i<GridManager.hardRegionCount; i++) {
            const regionCenter = this.extractCell(initializationData[i + 2]);
            this.hardRegionCenters.push(regionCenter);
        }
    }

    private extractCell(data: string) {
        const regex = /(\(\d\))\s(\(\d\)))/ // (x_coord, y_coord)
        const match = regex.exec(data);

        return this.grid.getCell(Number(match[1]), Number(match[0]));
    }
}