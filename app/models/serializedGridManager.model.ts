import { GridManager } from './gridManager.model';
import { Grid } from './grid.model';
import { Cell } from './cell.model';

export class SerializedGridManager extends GridManager {

    private _startCell: Cell;
    private _goalCell: Cell;

    private readonly serializedData: Array<string>;

    public get startCell() {
        return this._startCell;
    }

    public get goalCell() {
        return this._goalCell;
    }

    constructor(data: string) {
        super();
        this.serializedData = data.split('\r\n');
        this.create();
    }

    protected createGrid() {
        this._grid = new Grid(this.serializedData.splice(GridManager.hardRegionCount + 2));
    }

    protected initializeGrid() {
        this._startCell = this.extractCell(this.serializedData[0].trim());
        this._goalCell = this.extractCell(this.serializedData[1].trim());

        this.hardRegionCenters = new Array<Cell>();
        for (let i=0; i<GridManager.hardRegionCount; i++) {
            const regionCenter = this.extractCell(this.serializedData[i + 2]);
            this.hardRegionCenters.push(regionCenter);
        }
    }

    private extractCell(data: string) {
        const regex = /\((\d+),\s(\d+)\)/ // (x_coord, y_coord)
        const match = regex.exec(data);

        return this.grid.getCell(Number(match[2]), Number(match[1]));
    }
}