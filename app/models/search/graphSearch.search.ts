import { Cell } from '../cell.model';
import { PriorityQueue } from '../priorityQueue.model';

interface ExploredSet {
    [key: number]: Cell;
}

export abstract class GraphSearch {

    constructor(protected readonly start: Cell, protected readonly goal: Cell) {

    }

    findPath() {

    }

    protected abstract isFringeEmpty(): boolean;

    protected abstract isInClosedSet(cell: Cell): boolean;

    protected abstract expandCell(cell: Cell): void;

    protected abstract fringePush(cell: Cell): void;

    protected abstract fringePop(cell: Cell): void;
}