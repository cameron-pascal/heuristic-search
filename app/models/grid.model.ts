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

    private grid: Array<Array<Cell>>;

    public readonly width: number;
    public readonly length: number;

    constructor(length: number, width: number) {
        this.grid = this.constructGrid(length, width);
        this.width = width;
        this.length = length;
    }

    getAllCells() {
        return this.grid.slice();
    }

    getCell(row: number, col: number) {
        return this.grid[row][col];
    }

    serialize() {
        let serializedData = '';
        this.grid.forEach(row => {
            row.forEach(cell => {
                serializedData += cell.serialize();
            });
            serializedData += '\r\n';
        });

        return serializedData;
    }

    private constructGrid(rowCount: number, colCount: number) {
        let grid = new Array<Array<Cell>>();
        let count = 0;
        
        for (let rowIndex=0; rowIndex < rowCount; rowIndex++) {
            let row = new Array<Cell>();
            grid.push(row);
            for (let colIndex=0; colIndex < colCount; colIndex++) {
                row.push(new Cell(count++));
            }
        }

        for (let rowIndex=0; rowIndex < rowCount; rowIndex++) {
            for (let colIndex=0; colIndex < colCount; colIndex++) {
                this.setNeighbors([rowIndex, colIndex], grid);
            }
        }

        return grid;
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
            cell.registerNeighbor(Direction.Right, getNeighborRight());
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

        if (visitCount > 1) {
            console.log(cell);
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