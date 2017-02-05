import { Grid } from './grid.model';
import { Cell } from './cell.model';
import { Direction } from './cell.model';
import { CellType} from './cell.model';

class Rng {

    static getRandomBool() {
        const a = new Uint8Array(1);
        crypto.getRandomValues(a);
            return a[0] < 127;
    }

    static shuffleArray(array: Array<any>) {
        for (let i = 0; i < array.length; i++) {
            const j = this.generateRandomIntInclusive(0, i);
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    static generateRandomIntInclusive(min: number, max: number) {
        return Math.floor(Math.random() * ((max + 1) - min)) + min;
    }
}

class CellInfo {

    constructor(public cell: Cell, public coordinates: [number, number]) { }
}

export class GridManager {

    public readonly hardRegionCenters: Array<[number, number]>;

    private readonly hardRegionDimensions: [number, number] = [31, 31];
    private readonly hardRegionCount = 8;
    private readonly minPathLength = 100;
    private readonly pathTurnProb = 0.6;
    private readonly pathLegLength = 20;
    private readonly maxPathCount = 4;
    private readonly blockedProb = 0.2;
    private readonly startAndGoalRegionDimensions = [20, 20];
    private readonly minStartAndGoalDistance = 100;
    private readonly perpendicularUnblockedCost = 1;
    private readonly perpendicularPartiallyBlockedCost = 1;
    private readonly perpendicularDifferentCost = 1.5;
    private readonly diagonalUnblockedCost = Math.SQRT2;
    private readonly diagonalPartiallyBlockedCost = Math.SQRT2 + Math.SQRT2; // sqrt(8) = 2 * sqrt(2)
    private readonly diagonalDifferenCost = Math.SQRT2 * 1.5; // (sqrt(2) + sqrt(8)) /  2 = sqrt(2) * 1.5

    private availableStartAndGoalCellsMap: { [cellId: number]: CellInfo } = {};
    private availableStartAndGoalCells: Array<CellInfo>;

    private startCell: Cell;
    private goalCell: Cell;

    private grid: Grid;

    constructor(grid: Grid) {
        this.grid = grid;

        this.initializeStartAndGoalCells(grid);
        this.hardRegionCenters = this.populateHardRegions(grid, this.hardRegionCount, this.hardRegionDimensions);
        this.populateFastPaths(grid, this.maxPathCount, this.minPathLength, this.pathLegLength, this.pathTurnProb);
        this.populateBlockedCells(grid, this.blockedProb);
        this.availableStartAndGoalCells = this.setStartAndGoalCellsRegion();
        this.calculateMovementCosts(grid);
    }

    private calculateMovementCosts(grid: Grid) {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid.width; col++) {
                let cell = grid.getCell(row, col);
                this.calculateCost(cell);
            }
        }

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid.width; col++) {
                let cell = grid.getCell(row, col);
                cell.computeNeighborPriorityQueue();
            }
        }
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
                        cost = this.perpendicularUnblockedCost;
                    } else {
                        cost = this.perpendicularPartiallyBlockedCost;
                    }
                } else {
                    cost = this.perpendicularDifferentCost;
                }
            } else {
                if (isNeighborSame) {
                    if (cell.cellType === CellType.Unblocked) {
                        cost = this.diagonalUnblockedCost;
                    } else {
                        cost = this.diagonalPartiallyBlockedCost;
                    }
                } else {
                    cost = this.diagonalDifferenCost;
                }
            }

            if (neighbor.isFast) { 
                cost = cost / 4;
            }

            cell.registerCost(direction, cost);
        });
    }

    private isDirectionPerpendicular(direction: Direction) {
        return direction > 0 && (direction & (direction - 1)) === 0; // check if direction is power of 2 i.e it only has one high bit.
    }

    private calculateDistances(grid: Grid, goalCoordinates: [number, number]) {
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid.width; col++) {
                let cell = grid.getCell(row, col);
                let distance = this.calculateChebyshevDistance([row, col], goalCoordinates);
                cell.h = distance;
            }
        }
    }

    getNewStartAndGoalCells(): [Cell, Cell] {
        Rng.shuffleArray(this.availableStartAndGoalCells);

        let startCell = this.availableStartAndGoalCells[0].cell;
        let startCoordinates = this.availableStartAndGoalCells[0].coordinates;

        let goalCell: Cell;
        let goalCoordinates: [number, number];
        for (let i = 1; i < this.availableStartAndGoalCells.length; i++) {
             goalCell = this.availableStartAndGoalCells[i].cell;
             goalCoordinates = this.availableStartAndGoalCells[i].coordinates;

            let distance = this.calculateEuclidianDistance(startCoordinates, goalCoordinates);

            if (distance > this.minStartAndGoalDistance) {
                console.log('goal: ', goalCoordinates);
                console.log('\n');
                console.log('start: ', startCoordinates);
                break;
            }
        }

        this.calculateDistances(this.grid, goalCoordinates);
        return [startCell, goalCell];
    }

    private calculateEuclidianDistance(a: [number, number], b: [number, number]) { // [y, x]
        let x1 = a[1];
        let x2 = b[1];

        let y1 = a[0];
        let y2 = b[0];

        let xDelta = Math.abs(x1 - x2);
        let yDelta = Math.abs(y1 - y2);

        return Math.floor(Math.sqrt( (xDelta * xDelta) + (yDelta * yDelta) )); 
    }

    private calculateChebyshevDistance(a: [number, number], b: [number, number]) { // [y, x]
        let x1 = a[1];
        let x2 = b[1];

        let y1 = a[0];
        let y2 = b[0];

        let xDelta = Math.abs(x1 - x2);
        let yDelta = Math.abs(y1 - y2);
        
        return Math.floor(Math.max(xDelta, yDelta)); 
    }

    private setStartAndGoalCellsRegion() {
        let availableCells = new Array<CellInfo>();

        Object.keys(this.availableStartAndGoalCellsMap).forEach(id => {
            let cellInfo = this.availableStartAndGoalCellsMap[id];
            if (cellInfo !== null) {
                availableCells.push(cellInfo);
            }
        });

        return availableCells;
    }

    private initializeStartAndGoalCells(grid: Grid) {
        let rowStop = this.startAndGoalRegionDimensions[0];
        let colStop = this.startAndGoalRegionDimensions[1];

        for (let row = 0; row <= rowStop; row++) {
            for (let col = 0; col <= colStop; col++) {
                let topLeftCell = grid.getCell(row, col);
                let topRightCell = grid.getCell(row, grid.width - col - 1);
                let bottomLeftCell = grid.getCell(grid.length - row - 1, col);
                let bottomRightCell = grid.getCell(grid.length - row - 1, grid.width - col - 1);

                this.availableStartAndGoalCellsMap[topLeftCell.id] = new CellInfo(topLeftCell, [row, col]);
                this.availableStartAndGoalCellsMap[topRightCell.id] = new CellInfo(topRightCell, [row, grid.width - col - 1]);
                this.availableStartAndGoalCellsMap[bottomLeftCell.id] = new CellInfo(bottomLeftCell, [grid.length - row - 1, col]);
                this.availableStartAndGoalCellsMap[bottomRightCell.id] = new CellInfo(bottomRightCell, [grid.length - row - 1, grid.width - col - 1]);
            }
        }
    }

    private populateHardRegions(grid: Grid, regionCount: number, regionDimensions: [number, number]) {
        let midPoints = new Array<[number, number]>();

        for (let i = 0; i < regionCount; i++) {
            let regionStartRow = Rng.generateRandomIntInclusive(0, grid.length - regionDimensions[0] - 1);
            let regionStartCol = Rng.generateRandomIntInclusive(0, grid.width - regionDimensions[1] - 1);

            let rowMid = regionStartRow + Math.floor(regionDimensions[0] / 2);
            let colMid = regionStartCol + Math.floor(regionDimensions[1] / 2);

            midPoints.push([rowMid, colMid]);

            for (let row = 0; row < regionDimensions[0]; row++) {
                for (let col = 0; col < regionDimensions[1]; col++) {
                    if (Rng.getRandomBool()) {
                        grid.getCell(row + regionStartRow, col + regionStartCol).cellType = CellType.PartiallyBlocked;
                    }
                }
            }
        }
        return midPoints;
    }

    private populateFastPaths(grid: Grid, pathLimit: number, minPathLength: number, legLength: number, turnProb: number) {
        let paths = new Array<Array<Cell>>();
        let tryLimit = ((2 * grid.length) + (2 * grid.width)) - 4;
        let edgeCoordinates = this.initializeEdgeCoordinates(grid); 
        while (paths.length < pathLimit) {
            let path = new Array<Cell>();
            let tries = 0;

            let currentCell = this.getRandomEdgeCell(grid, edgeCoordinates);
            let direction = this.getRandomCardinalDirection(currentCell);
            if (currentCell.isFast) {
                continue;
            }

            currentCell.isFast = true;
            path.push(currentCell);
            currentCell = currentCell.getNeigbor(direction);

            while (tries < tryLimit && currentCell != null) {
                
                if (currentCell.isFast) {
                    break;
                }

                currentCell.isFast = true;
                path.push(currentCell);

                if (path.length % legLength === 0) {
                    if (Math.random() > turnProb) {
                        let shouldMovePositive = Rng.getRandomBool();
                        if (direction === Direction.Up || direction === Direction.Down) {
                            if (shouldMovePositive) {
                                direction = Direction.Right;
                            } else {
                                direction = Direction.Left;
                            }
                        } else {
                            if (shouldMovePositive) {
                                direction = Direction.Down;
                            } else {
                                direction = Direction.Up;
                            }
                        }
                    }

                    currentCell = currentCell.getNeigbor(direction);
                    if (currentCell === null || currentCell.isFast) {
                        break;
                    }
                
                    currentCell.isFast = true;
                    path.push(currentCell);
                }

                currentCell = currentCell.getNeigbor(direction);
            }

            if (tries >= tryLimit) {
                path.forEach(cell => {
                    cell.isFast = false;
                });
                paths.forEach(path => {
                    path.forEach(cell => {
                        cell.isFast = false;
                    });
                });
                paths = new Array<Array<Cell>>();
                tries = 0; 
            } else if (currentCell != null) {
                path.forEach(cell => {
                    cell.isFast = false;
                });
                tries++;
            } else if (path.length < minPathLength) {
                path.forEach(cell => {
                    cell.isFast = false;
                });
                tries++;
            } else {
                paths.push(path);
                tries = 0;
            }
        }
    }

    private getRandomCardinalDirection(cell: Cell) {
        let directions = cell.availableCardinalDirections;
        Rng.shuffleArray(directions);

        return directions[0];
    }

    private initializeEdgeCoordinates(grid: Grid) {
        let edgeCoordinates = new Array<[number, number]>();

        for (let col = 0; col < grid.width; col++) {
            edgeCoordinates.push([0, col]);
            edgeCoordinates.push([grid.length - 1, col]);
        }

        for (let row = 1; row < grid.length - 1; row++) {
            edgeCoordinates.push([row, 0]);
            edgeCoordinates.push([row, grid.width - 1]);
        }

        return edgeCoordinates;
    }

    private getRandomEdgeCell(grid: Grid, edgeCoordinates: Array<[number, number]>) {
        Rng.shuffleArray(edgeCoordinates);

        let randomCoordinate = edgeCoordinates[0];
        
        return grid.getCell(randomCoordinate[0], randomCoordinate[1]);
    }

    private populateBlockedCells(grid: Grid, blockedProb: number) { 

        let startAndGoalRegionRow = this.startAndGoalRegionDimensions[0];
        let startAndGoalRegionCol = this.startAndGoalRegionDimensions[1];

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid.width; col++) {
                let cell = grid.getCell(row, col);
                
                if (cell.isFast) {
                    continue;
                }
                
                if (Math.random() <= blockedProb) {
                    cell.cellType = CellType.Blocked;
                    if (row <= startAndGoalRegionRow - 1 && col <= startAndGoalRegionCol) {
                        this.availableStartAndGoalCellsMap[cell.id] = null;
                    }
                }
            }
        }
    }
}