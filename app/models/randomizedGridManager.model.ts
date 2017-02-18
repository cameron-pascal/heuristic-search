import { Grid } from './grid.model';
import { Cell } from './cell.model';
import { Direction } from './cell.model';
import { CellType} from './cell.model';
import { GridManager } from './gridManager.model';

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

export class RandomizedGridManager extends GridManager {

    private static readonly hardRegionDimensions: [number, number] = [31, 31];
    private static readonly minPathLength = 100;
    private static readonly pathTurnProbability = 0.6;
    private static readonly pathLegLength = 20;
    private static readonly maxPathCount = 4;
    private static readonly blockedProbability = 0.2;
    private static readonly startAndGoalRegionDimensions = [20, 20];
    private static readonly minStartAndGoalDistance = 100;

    private availableStartAndGoalCellsMap: { [cellId: number]: Cell } = {};
    private availableStartAndGoalCells: Array<Cell>;
    private currentStartAndGoalCells: [Cell, Cell];

    protected get startCell() {
        return this.currentStartAndGoalCells[0];
    }

    protected get goalCell() {
        return this.currentStartAndGoalCells[1];
    }

    constructor(grid: Grid) {
        super(grid);
        this.create();
    }

    protected initializeGrid() {
        this.initializeStartAndGoalCells(this.grid);
        this.hardRegionCenters = this.populateHardRegions(this.grid, GridManager.hardRegionCount, RandomizedGridManager.hardRegionDimensions);
        this.populateFastPaths(this.grid, RandomizedGridManager.maxPathCount, RandomizedGridManager.minPathLength, RandomizedGridManager.pathLegLength, RandomizedGridManager.pathTurnProbability);
        this.populateBlockedCells(this.grid, RandomizedGridManager.blockedProbability);
        this.availableStartAndGoalCells = this.setStartAndGoalCellsRegion();
    }

    getNewStartAndGoalCells(): [Cell, Cell] {
        Rng.shuffleArray(this.availableStartAndGoalCells);

        let startCell = this.availableStartAndGoalCells[0];

        let goalCell: Cell;
        let goalIndex = 1;
        for (let i = goalIndex; i < this.availableStartAndGoalCells.length; i++) {
            goalIndex = i;
            goalCell = this.availableStartAndGoalCells[i];

            const distance = this.grid.getEuclidianDistance(startCell, goalCell);

            if (distance > RandomizedGridManager.minStartAndGoalDistance) {
                break;
            }
        }

        this.currentStartAndGoalCells = [this.availableStartAndGoalCells[0], this.availableStartAndGoalCells[goalIndex]];
        
        return [startCell, goalCell];
    }

    private setStartAndGoalCellsRegion() {
        const availableCells = new Array<Cell>();

        Object.keys(this.availableStartAndGoalCellsMap).forEach(id => {
            const cell = this.availableStartAndGoalCellsMap[id];
            if (cell !== null) {
                availableCells.push(cell);
            }
        });

        return availableCells;
    }

    private initializeStartAndGoalCells(grid: Grid) {
        let rowStop = RandomizedGridManager.startAndGoalRegionDimensions[0];
        let colStop = RandomizedGridManager.startAndGoalRegionDimensions[1];

        for (let row = 0; row <= rowStop; row++) {
            for (let col = 0; col <= colStop; col++) {
                let topLeftCell = grid.getCell(row, col);
                let topRightCell = grid.getCell(row, grid.width - col - 1);
                let bottomLeftCell = grid.getCell(grid.length - row - 1, col);
                let bottomRightCell = grid.getCell(grid.length - row - 1, grid.width - col - 1);

                this.availableStartAndGoalCellsMap[topLeftCell.id] = topLeftCell;
                this.availableStartAndGoalCellsMap[topRightCell.id] = topRightCell;
                this.availableStartAndGoalCellsMap[bottomLeftCell.id] = bottomLeftCell;
                this.availableStartAndGoalCellsMap[bottomRightCell.id] = bottomRightCell;
            }
        }
    }

    private populateHardRegions(grid: Grid, regionCount: number, regionDimensions: [number, number]) {
        let centerCells = new Array<Cell>();

        for (let i = 0; i < regionCount; i++) {
            let regionStartRow = Rng.generateRandomIntInclusive(0, grid.length - regionDimensions[0] - 1);
            let regionStartCol = Rng.generateRandomIntInclusive(0, grid.width - regionDimensions[1] - 1);

            let rowMid = regionStartRow + Math.floor(regionDimensions[0] / 2);
            let colMid = regionStartCol + Math.floor(regionDimensions[1] / 2);

            centerCells.push(grid.getCell(rowMid, colMid));

            for (let row = 0; row < regionDimensions[0]; row++) {
                for (let col = 0; col < regionDimensions[1]; col++) {
                    if (Rng.getRandomBool()) {
                        grid.getCell(row + regionStartRow, col + regionStartCol).cellType = CellType.PartiallyBlocked;
                    }
                }
            }
        }
        return centerCells;
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

        let startAndGoalRegionRow = RandomizedGridManager.startAndGoalRegionDimensions[0];
        let startAndGoalRegionCol = RandomizedGridManager.startAndGoalRegionDimensions[1];

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