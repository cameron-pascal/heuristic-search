import { Grid } from './grid.model';
import { Cell } from './cell.model';
import { Direction } from './cell.model';
import { CellType} from './cell.model';

class Rng {

    static getRandomBool() {
        var a = new Uint8Array(1);
        crypto.getRandomValues(a);
            return a[0] < 127;
    }

    static shuffleArray(array: Array<any>) {
        for (let i=0; i<array.length; i++) {
            let j = this.generateRandomIntInclusive(0, i);
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    static generateRandomIntInclusive(min: number, max: number) {
        return Math.floor(Math.random() * ((max + 1) - min)) + min;
    }
}

export class GridInitializer {

    private readonly hardProb = 0.5;
    private readonly hardRegionDimensions: [number, number] = [31, 31];
    private readonly hardRegionCount = 8;
    private readonly minPathLength = 100;
    private readonly pathTurnProb = 0.6;
    private readonly pathLegLength = 20;
    private readonly maxPathCount = 4;
    private readonly blockedProb = 0.2;

    public readonly regionCenters: Array<[number, number]>;

    constructor(grid: Grid) {

        this.regionCenters = this.generateHardRegionCenters(
                grid.length, 
                grid.width,
                this.hardRegionCount,
                this.hardRegionDimensions);

        this.populateHardRegions(grid, this.regionCenters, this.hardRegionDimensions, this.hardProb);
        this.populateFastPaths(grid, this.maxPathCount, this.minPathLength, this.pathLegLength, this.pathTurnProb);
        this.populateBlockedCells(grid, this.blockedProb);
    }

    private populateBlockedCells(grid: Grid, blockedProb: number) {      
        for (let row=0; row<grid.length; row++) {
            for (let col=0; col<grid.width; col++) {
                let cell = grid.getCell(row, col);
                
                if (cell.isFast) {
                    continue;
                }
                
                if (Math.random() <= blockedProb) {
                    cell.cellType = CellType.Blocked;
                }
            }
        }
    }

    private populateFastPaths(
        grid: Grid,
        maxPathCount: number,
        pathLength: number, 
        legLength: number, 
        turnProb: number) {

        let pathCount = 0;

        while (pathCount < maxPathCount) {
            let startCell = this.getRandomEdgeCell(grid);
            let limit = grid.length + grid.width;
            let wasSuccesfull = this.populateFastPath(startCell, pathLength, legLength, turnProb, limit);
        }
    }

    private populateFastPath(startingCell: Cell, pathLength: number, legLength: number, turnProb: number, limit: number) {
        let path = new Array<Cell>();
        let direction = this.getRandomDirection(startingCell);

        let currentCell = startingCell;
        let fastPathIntersectCount = 0;

        while (fastPathIntersectCount <= limit) {
            let leg = this.populateFastPathLeg(currentCell, direction, legLength);
            
            if (leg === null) {
                fastPathIntersectCount++;
                this.clearPath(path);
                path = new Array<Cell>();
                direction = this.getRandomDirection(startingCell);
                currentCell = startingCell;
                continue;
            }

            leg.forEach(function(legCell) {
                path.push(legCell);
            });

            let lastCell = path[path.length - 1].getNeigbor(direction);
            if (lastCell === null) { // boundary
                if (path.length >= legLength) {
                    return true;
                } else {
                    this.clearPath(path);
                    path = new Array<Cell>();
                    direction = this.getRandomDirection(startingCell);
                    currentCell = startingCell;
                    continue;
                }
            }

            if (Math.random() > turnProb) {
                let shoudlMovePositive = Rng.getRandomBool();
                if (direction === Direction.Up) {
                    if (shoudlMovePositive) {
                        direction = Direction.Right
                    } else {
                        direction = Direction.Left;
                    }
                } else {
                    if (shoudlMovePositive) {
                        direction = Direction.Down
                    } else {
                        direction = Direction.Up;
                    }
                }
            }

            let nextCell = currentCell.getNeigbor(direction);
            currentCell = nextCell;

            if (currentCell === null) { // boundary
                if (path.length >= legLength) {
                    return true;
                } else {
                    this.clearPath(path);
                    path = new Array<Cell>();
                    direction = this.getRandomDirection(startingCell);
                    currentCell = startingCell;
                    continue;
                }
            }
        }

        return false;
    }

    private populateFastPathLeg(cell: Cell, direction: Direction, legLength: number) {
        let currentCell = cell;
        let leg = new Array<Cell>();
        
        for (let i=1; i<=legLength; i++) {  
            if (cell.isFast) {
                return null;
            }

            cell.isFast = true;
            let nextCell = cell.getNeigbor(direction);

            if (nextCell === null) { // hit a boundary
                return leg;
            }

            leg.push(nextCell);
            cell = nextCell;
        }

        return leg;
    }

    private getRandomDirection(cell: Cell) {
        let directions = cell.availableCardinalDirections;
        Rng.shuffleArray(directions);

        return directions[0];
    }

    private clearPath(path: Array<Cell>) {
        path.forEach(function (cell) {
            cell.isFast = false;
        });
    }

    private getRandomEdgeCell(grid: Grid) {
        // The idea here is that we unroll the edges into a flat array and then randomlly pick one.
        let edgeCoordinates = new Array<[number, number]>();

        for (let col=0; col<grid.width; col++) {
            edgeCoordinates.push([0, col]);
            edgeCoordinates.push([grid.length - 1, col]);
        }

        for (let row=1; row<length - 1; row++) {
            edgeCoordinates.push([row, 0]);
            edgeCoordinates.push([row, grid.width - 1]);
        }
        
        Rng.shuffleArray(edgeCoordinates);

        let randomCoordinate = edgeCoordinates[0];
        
        return grid.getCell(randomCoordinate[0], randomCoordinate[1]);
    }

    private generateHardRegionCenters(
        rowCount: number, 
        colCount: number, 
        regionCount: number, 
        regionDimensions: [number, number]) {
        
        let regions = new Array<[number, number]>();
        
        let allowableAreaMinRow = regionDimensions[0] - 1;
        let allowableAreaMaxRow = rowCount - regionDimensions[0]
        let allowableAreaMinCol = regionDimensions[1] - 1;
        let allowableAreaMaxCol = colCount - regionDimensions[1];

        for(let i=0; i<regionCount; i++) {
            let regionCenterRow = Rng.generateRandomIntInclusive(allowableAreaMinRow, allowableAreaMaxRow);
            let regionCenterCol = Rng.generateRandomIntInclusive(allowableAreaMinCol, allowableAreaMaxCol);

            regions.push([regionCenterRow, regionCenterCol]);
        }

        return regions;
    }

    private populateHardRegions(grid: Grid, 
                                regionCenters: Array<[number, number]>, 
                                regionDimensions: [number, number],
                                hardProb: number ) {
        // Assume region dimensions are odd.
        let regionRowRadius = (regionDimensions[0] - 1) / 2;
        let regionColRadius = (regionDimensions[1] - 1) / 2;

        regionCenters.forEach(function (regionCenter) {
            let row = regionCenter[0] - regionRowRadius;
            let rowMax = regionCenter[0] + regionRowRadius;
            let col = regionCenter[1] - regionColRadius;
            let colMax = regionCenter[1] + regionColRadius;

            for (; row <= rowMax; row++) {
                for (; col <= colMax; col++) {
                    if (Math.random() <= hardProb) {
                        let cell = grid.getCell(row, col);
                        cell.cellType = CellType.PartiallyBlocked;
                    }
                }
            }
        });
    }
}