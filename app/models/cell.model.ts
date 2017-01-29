export enum CellType {
    Unblocked,
    Blocked,
    PartiallyBlocked
}

export enum Direction {
    Up    = 1,
    Down  = 1 << 1,
    Left  = 1 << 2,
    Right = 1 << 3
}

export class Cell {

    private neighborsHash: Array<Cell>;
    private _availableDirections: Array<Direction>;
    private _availableCardinalDirections: Array<Direction>;
    private _isFast = false;
    private _cellType: CellType = CellType.Unblocked; 

    constructor() {
        const size = Direction.Down | Direction.Left | Direction.Right | Direction.Up;
        this._availableDirections = new Array<Direction>();
        this._availableCardinalDirections = new Array<Direction>();
        this.neighborsHash = new Array<Cell>(size);
        for (let i=0; i<size; i++) {
            this.neighborsHash[i] = null;
        }
    }

    registerNeighbor(direction: Direction, neighbor: Cell) {
        
        if (this.neighborsHash[direction] === null) {
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

        this.neighborsHash[direction] = neighbor;
    }

    getNeigbor(direction: Direction) {
        return this.neighborsHash[direction];
    }

    get availableDirections() {
        return this._availableDirections.slice();
    }

    get availableCardinalDirections() {
        return this._availableCardinalDirections.slice();
    }

    get isFast() {
        return this._isFast;
    }

    set isFast(isFast: boolean) {
        if (this._cellType !== CellType.Blocked && isFast) {
            this._isFast = isFast;
        }
    }

    get cellType() {
        return this._cellType;
    }
    
    set cellType(cellType: CellType) {
        if (cellType === CellType.Blocked) {
            this._isFast = false;
        }

        this._cellType = cellType;
    }
}