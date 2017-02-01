import { BinaryMinHeap } from './binaryMinHeap.model';

export enum CellType {
    Unblocked = 1,
    Blocked = 1 << 1,
    PartiallyBlocked = 1 << 2
}

export enum Direction {
    Up    = 1,
    Down  = 1 << 1,
    Left  = 1 << 2,
    Right = 1 << 3
}

export class Cell {

    private _neighborsHash: Array<Cell>;
    private _availableDirections: Array<Direction>;
    private _availableCardinalDirections: Array<Direction>;
    private readonly _id: number;
    private _neighborCosts: Array<number>;
    private _priorityQueue: BinaryMinHeap<Cell>;

    h: number; // cheapest possible to end
    f: number; // g + h
    g: number; // cost from path to start node
    parent: Cell; // parent that the cell game from

    private weight: number;
    

    cellType: CellType = CellType.Unblocked;
    isFast = false;
    visited = false;

    constructor(id: number) {
        this._id = id;
        
        const size = Direction.Down | Direction.Left | Direction.Right | Direction.Up;
        
        this._availableDirections = new Array<Direction>();
        this._availableCardinalDirections = new Array<Direction>();
        this._neighborsHash = new Array<Cell>();
        this._neighborCosts = new Array<number>();
        
        for (let i = 0; i <= size; i++) {
            this._neighborsHash.push(null);
            this._neighborCosts.push(null);
        }

        this.h = Infinity;
        this.f = null;
        this.g = 0;
        this.parent = null;
        
    }

    getAllCosts() {
        const costs = new Array<number>();
        this._neighborCosts.forEach(cost => {
            if (cost === null) {
                costs.push(cost);
            }
        });

        return costs;
    }

    computeNeighborPriorityQueue() {
         const neighborCostTuples = this._availableDirections.map(direction => {
            const neighbor = this._neighborsHash[direction];
            const cost = this._neighborCosts[direction];
            const tuple: [Cell, number] = [neighbor, cost];
            return tuple;
        });

       this._priorityQueue =  new BinaryMinHeap<Cell>(() => this._id, neighborCostTuples);
    }

    getCost (direction: Direction){
        return this._neighborCosts[direction];
    }

    registerCost(direction: Direction, cost: number) {
        this._neighborCosts[direction] = cost;
    }

    registerNeighbor(direction: Direction, neighbor: Cell) {

        if (this._neighborsHash[direction] === null) {
            this._availableDirections.push(direction);
            switch (direction) {
                case Direction.Up:
                    this._availableCardinalDirections.push(direction);
                    break;
                case Direction.Down:
                    this._availableCardinalDirections.push(direction);
                    break;
                case Direction.Left:
                    this._availableCardinalDirections.push(direction);
                    break;
                case Direction.Right:
                    this._availableCardinalDirections.push(direction);
                    break;
            }
        }

        this._neighborsHash[direction] = neighbor;
    }

    serialize() {
        if (this.cellType === CellType.Blocked) {
            return '0';
        }

        if (this.cellType === CellType.Unblocked) {
            if (this.isFast) {
                return 'a';
            }

            return '1';
        }

        if (this.isFast) {
            return 'b';
        }

        return '2';
    }

    getNeigbor(direction: Direction) {
        return this._neighborsHash[direction];
    }

    get neighborPriorityQueue() {
        return this._priorityQueue;
    }

    get availableDirections() {
        return this._availableDirections.slice();
    }

    get availableCardinalDirections() {
        return this._availableCardinalDirections.slice();
    }

    get id() {
        return this._id;
    }
}