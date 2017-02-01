import { Cell } from '../cell.model';
import { BinaryMinHeap } from './binaryMinHeap.search.model';

interface ExploredSet {
    [key: number]: Cell
}

export abstract class GraphSearch {

    private readonly _frontier: BinaryMinHeap<Cell>;
    private readonly _explored: ExploredSet = {};

    constructor(private readonly startCell: Cell, private readonly goalCell: Cell) {
        this._frontier = new BinaryMinHeap<Cell>();
        this._frontier.push(startCell, 0);
     }

     public getPath() {

         if (this._frontier.count === 0) {
             // report failure
         }

         if ()
     }

}