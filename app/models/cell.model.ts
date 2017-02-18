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
    

    cellType: CellType = CellType.Unblocked;
    isFast = false;
  

    constructor(id: number, data?: string) {
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
        
        if (data) {
            this.deserialize(data);
        }
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

    getMovementCost (direction: Direction){
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

    private deserialize(data: string) {
        switch (data) {
            case '0':
                this.cellType = CellType.Blocked;
                break;
            case '1':
                this.cellType = CellType.Unblocked;
                break;
            case '2':
                this.cellType = CellType.PartiallyBlocked;
                break;
            case 'a':
                this.cellType = CellType.Unblocked;
                this.isFast = true;
                break;
            case 'b':
                this.cellType = CellType.PartiallyBlocked;
                this.isFast = true;
                break;
        }
    }

    getNeigbor(direction: Direction) {
        return this._neighborsHash[direction];
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