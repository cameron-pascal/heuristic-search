import { Cell } from './cell.model';
import { Direction } from './cell.model';

enum CellPosition {
    Interior   = 1,
    LeftEdge   = 1 << 1,
    RightEdge  = 1 << 2,
    TopEdge    = 1 << 3,
    BottomEdge = 1 << 4,
    LeftTopCorner = LeftEdge | TopEdge,
    LeftBottomCorner = LeftEdge | BottomEdge,
    RightTopCorner = RightEdge | TopEdge,
    RightBottomCorner = RightEdge | BottomEdge
}

export class Grid {
    private readonly grid: Array<Array<Cell>>;

    public readonly width: number;
    public readonly length: number;

    private coordinateMap: { [id: number] : [number, number] } = {};

    constructor(dataOrDimensions: [number, number] | Array<string>) {
        let createCell: (coordinate: [number, number], id: number) => Cell;
        const self = this;
        if (typeof dataOrDimensions[0] === 'number') {
            const dimensions = dataOrDimensions as [number, number];
            this.length = dimensions[0];
            this.width = dimensions[1];
            createCell = function(coordinate: [number, number], id: number) {
                self.coordinateMap[id] = coordinate;
                return new Cell(id);
            };
        } else {
            const data = dataOrDimensions as Array<string>;
            this.length = data.length;
            this.width = data[0].length;
            createCell = function(coordinate: [number, number], id: number) {
                const row = data[coordinate[0]].trim();
                const cellData = row.charAt(coordinate[1]);
                self.coordinateMap[id] = coordinate;
                return new Cell(id, cellData);
            };
        }

        this.grid = new Array<Array<Cell>>();
        let cellId = 0;
        
        for (let rowIndex=0; rowIndex < this.length; rowIndex++) {
            const row = new Array<Cell>();
            this.grid.push(row);
            for (let colIndex=0; colIndex < this.width; colIndex++) {
                const cell = createCell([rowIndex, colIndex], cellId++);
                row.push(cell);
            }
        }

        for (let rowIndex=0; rowIndex < this.length; rowIndex++) {
            for (let colIndex=0; colIndex < this.width; colIndex++) {
                this.setNeighbors([rowIndex, colIndex], this.grid);
            }
        }
    }

    getEuclidianDistance(a: Cell, b: Cell) { // [y, x]
        const aCoord = this.coordinateMap[a.id];
        const bCoord = this.coordinateMap[b.id];

        const x1 = aCoord[1];
        const x2 = bCoord[1];

        const y1 = aCoord[0];
        const y2 = bCoord[0];

        const xDelta = Math.abs(x1 - x2);
        const yDelta = Math.abs(y1 - y2);

        return Math.floor(Math.sqrt( (xDelta * xDelta) + (yDelta * yDelta) )); 
    }

    getChebyshevDistance(a: Cell, b: Cell) { // [y, x]
        const aCoord = this.coordinateMap[a.id];
        const bCoord = this.coordinateMap[b.id];

        const x1 = aCoord[1];
        const x2 = bCoord[1];

        const y1 = aCoord[0];
        const y2 = bCoord[0];

        const xDelta = Math.abs(x1 - x2);
        const yDelta = Math.abs(y1 - y2);
        
        return Math.floor(Math.max(xDelta, yDelta)); 
    }

    getAllCells() {
        return this.grid.slice();
    }

    getCell(row: number, col: number) {
        return this.grid[row][col];
    }

    getCoordinate(cell: Cell) {
        return this.coordinateMap[cell.id];
    }

    serialize() {
        let serializedData = '';

        let i=0;
        for (; i<this.length - 1; i++) {
            for (let j=0; j<this.width; j++) {
                const cell = this.grid[i][j];
                serializedData += cell.serialize();
            }
            serializedData += '\r\n';
        }

        for (let j=0; j<this.width; j++) {
            const cell = this.grid[i][j];
            serializedData += cell.serialize();
        }

        return serializedData;
    }

    private deserializeGrid(data: string) {
        


    }

    private constructGrid(rowCount: number, colCount: number, serializecData?: Array<string>) {
        
    }

    private setNeighbors(cellCoordinate: [number, number], grid: Array<Array<Cell>>) {
        let row = cellCoordinate[0];
        let col = cellCoordinate[1];

        let cell = grid[row][col];

        function getNeighborAbove() {
            return grid[row - 1][col];
        }

        function getNeighborBelow() {
            return grid[row + 1][col];
        }

        function getNeighborLeft() {
            return grid[row][col - 1];
        }

        function getNeighborRight() {
            return grid[row][col + 1];
        }

        function getNeighborAboveLeft() {
            return grid[row - 1][col - 1];
        }

        function getNeighborAboveRight() {
            return grid[row - 1][col + 1];
        }

        function getNeighborBelowRight() {
            return grid[row + 1][col + 1];
        }

        function getNeighborBelowLeft() {
            return grid[row + 1][col - 1];
        }

        let cellPosition = this.getCellPosition(cellCoordinate, grid.length, grid[0].length);

        let visitCount = 0;
        if (cellPosition === CellPosition.LeftTopCorner) {
            cell.registerNeighbor(Direction.Down, getNeighborBelow());
            cell.registerNeighbor(Direction.Right, getNeighborRight());
            cell.registerNeighbor(Direction.Down | Direction.Right, getNeighborBelowRight());
            visitCount++
        }

        if (cellPosition === CellPosition.RightTopCorner) {
            cell.registerNeighbor(Direction.Down, getNeighborBelow());
            cell.registerNeighbor(Direction.Left, getNeighborLeft());
            cell.registerNeighbor(Direction.Down | Direction.Left, getNeighborBelowLeft());
            visitCount++;
        }

        if (cellPosition === CellPosition.LeftBottomCorner) {
            cell.registerNeighbor(Direction.Up, getNeighborAbove());
            cell.registerNeighbor(Direction.Right, getNeighborRight());
            cell.registerNeighbor(Direction.Up | Direction.Right, getNeighborAboveRight());
            visitCount++;
        }

        if (cellPosition === CellPosition.RightBottomCorner) {
            cell.registerNeighbor(Direction.Up, getNeighborAbove());
            cell.registerNeighbor(Direction.Left, getNeighborLeft());
            cell.registerNeighbor(Direction.Up | Direction.Left, getNeighborAboveLeft());
            visitCount++;
        }

        if (cellPosition === CellPosition.TopEdge) {
            cell.registerNeighbor(Direction.Down, getNeighborBelow());
            cell.registerNeighbor(Direction.Right, getNeighborRight());
            cell.registerNeighbor(Direction.Down | Direction.Right, getNeighborBelowRight());
            cell.registerNeighbor(Direction.Left, getNeighborLeft());
            cell.registerNeighbor(Direction.Down | Direction.Left, getNeighborBelowLeft());
            visitCount++;
        }

        if (cellPosition === CellPosition.BottomEdge) {
            cell.registerNeighbor(Direction.Up, getNeighborAbove());
            cell.registerNeighbor(Direction.Left, getNeighborLeft());
            cell.registerNeighbor(Direction.Up | Direction.Right, getNeighborAboveRight());
            cell.registerNeighbor(Direction.Right, getNeighborRight());
            cell.registerNeighbor(Direction.Up | Direction.Left, getNeighborAboveLeft());
            visitCount++;
        }

        if (cellPosition === CellPosition.LeftEdge) {
            cell.registerNeighbor(Direction.Up, getNeighborAbove());
            cell.registerNeighbor(Direction.Right, getNeighborRight());
            cell.registerNeighbor(Direction.Up | Direction.Right, getNeighborAboveRight());
            cell.registerNeighbor(Direction.Down | Direction.Right, getNeighborBelowRight());
            cell.registerNeighbor(Direction.Down, getNeighborBelow());
            visitCount++;
        }

        if (cellPosition === CellPosition.RightEdge) {
            cell.registerNeighbor(Direction.Up, getNeighborAbove());
            cell.registerNeighbor(Direction.Left, getNeighborLeft());
            cell.registerNeighbor(Direction.Up | Direction.Left, getNeighborAboveLeft());
            cell.registerNeighbor(Direction.Down | Direction.Left, getNeighborBelowLeft());
            cell.registerNeighbor(Direction.Down, getNeighborBelow());
            visitCount++;
        }

        if (cellPosition === CellPosition.Interior) {
            cell.registerNeighbor(Direction.Up, getNeighborAbove());
            cell.registerNeighbor(Direction.Left, getNeighborLeft());
            cell.registerNeighbor(Direction.Up | Direction.Left, getNeighborAboveLeft());
            cell.registerNeighbor(Direction.Down | Direction.Left, getNeighborBelowLeft());
            cell.registerNeighbor(Direction.Down, getNeighborBelow());
            cell.registerNeighbor(Direction.Right, getNeighborRight());
            cell.registerNeighbor(Direction.Up | Direction.Right, getNeighborAboveRight());
            cell.registerNeighbor(Direction.Down | Direction.Right, getNeighborBelowRight());
            visitCount++;
        }
        return cell;
    } 

    private getCellPosition(cellCoordinate: [number, number], rowCount: number, colCount: number) {
        let row = cellCoordinate[0];
        let col = cellCoordinate[1];

        let cellPosition: CellPosition = 0;

        if (col === 0) {
            cellPosition = (cellPosition) ? cellPosition |= CellPosition.LeftEdge: CellPosition.LeftEdge;
        }

        if (col === colCount - 1) {
            cellPosition = (cellPosition) ? cellPosition |= CellPosition.RightEdge: CellPosition.RightEdge;
        }

        if (row === 0) {
            cellPosition = (cellPosition) ? cellPosition |= CellPosition.TopEdge: CellPosition.TopEdge;
        }

        if (row === rowCount - 1) {
            cellPosition = (cellPosition) ? cellPosition |= CellPosition.BottomEdge: CellPosition.BottomEdge;
        }

        if (!cellPosition) {
            cellPosition = CellPosition.Interior;
        }

        return cellPosition;
    }
}