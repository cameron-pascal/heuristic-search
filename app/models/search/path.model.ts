import { Grid } from '../grid.model';
import { Cell } from '../cell.model';
import { Direction } from '../cell.model';
import { CellType} from '../cell.model';

export class path {

    private cell: Cell;
    private coordinates: [number, number];
    
    constructor(Cell: Cell, X: number, Y:number) {
        this.cell = Cell;
        this.coordinates[1] = X;
        this.coordinates[0] = Y;
    }

}