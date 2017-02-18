import { Cell, CellType, Direction } from './cell.model';
import { Grid } from './grid.model';

export abstract class GridManager {

    protected static readonly hardRegionCount = 8;

    private static readonly perpendicularUnblockedCost = 1;
    private static readonly perpendicularPartiallyBlockedCost = 1;
    private static readonly perpendicularDifferentCost = 1.5;
    private static readonly diagonalUnblockedCost = Math.SQRT2;
    private static readonly diagonalPartiallyBlockedCost = Math.SQRT2 + Math.SQRT2; // sqrt(8) = 2 * sqrt(2)
    private static readonly diagonalDifferenCost = Math.SQRT2 * 1.5; // (sqrt(2) + sqrt(8)) /  2 = sqrt(2) * 1.5

    
    protected hardRegionCenters: Array<Cell>;

    protected readonly grid: Grid;

    protected abstract get startCell(): Cell;

    protected abstract get goalCell(): Cell;

    constructor(grid: Grid, initializationData?: any) {
        this.grid = grid;
        const self = this;

        this.create = function(initializationData) {
            self.initializeGrid(initializationData);
            self.calculateMovementCosts(this.grid);
        }
    }

    protected create: (initializationData?: any) => void;

    protected abstract initializeGrid(initializationData?: any): void;

    public serialize() {
        let serializedData = this.serializeToCoordinate(this.startCell) + '\r\n' + this.serializeToCoordinate(this.goalCell);
        this.hardRegionCenters.forEach(coordinate => {
            serializedData += this.serializeToCoordinate(coordinate) + '\r\n';
        });

        serializedData += this.grid.serialize();

        return serializedData;
    }

    private serializeToCoordinate(cell: Cell) {
        const coordinate = this.grid.getCoordinate(cell);
        return '(' + coordinate[1] + ', ' + coordinate[0] + ')';
    }

    private calculateMovementCosts(grid: Grid) {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid.width; col++) {
                const cell = grid.getCell(row, col);
                this.calculateCost(cell);
            }
        }
    }

    private isDirectionPerpendicular(direction: Direction) {
        return direction > 0 && (direction & (direction - 1)) === 0; // check if direction is power of 2 i.e it only has one high bit.
    }

    private calculateCost(cell: Cell) {
        cell.availableDirections.forEach(direction => {
            let neighbor = cell.getNeigbor(direction);
            if (neighbor.cellType === CellType.Blocked) {
                cell.registerCost(direction, Infinity);
                return;
            }

            let isNeighborSame = neighbor.cellType - cell.cellType === 0;
            let isPerpendicular = this.isDirectionPerpendicular(direction);
            let cost: number;
            if (isPerpendicular) {
                if (isNeighborSame) {
                    if (cell.cellType === CellType.Unblocked) {
                        cost = GridManager.perpendicularUnblockedCost;
                    } else {
                        cost = GridManager.perpendicularPartiallyBlockedCost;
                    }
                } else {
                    cost = GridManager.perpendicularDifferentCost;
                }
            } else {
                if (isNeighborSame) {
                    if (cell.cellType === CellType.Unblocked) {
                        cost = GridManager.diagonalUnblockedCost;
                    } else {
                        cost = GridManager.diagonalPartiallyBlockedCost;
                    }
                } else {
                    cost = GridManager.diagonalDifferenCost;
                }
            }

            if (neighbor.isFast) { 
                cost = cost / 4;
            }

            cell.registerCost(direction, cost);
        });
    }
}