import { Grid } from './grid.model';
import { Cell } from './cell.model';
import { Direction } from './cell.model';
import { CellType} from './cell.model';
import { BinaryMinHeap} from './binaryMinHeap.model';

export enum SearchType {
    AStar,
    WeightedAStar,
    Uniformed,
	SequentialHeuristic,
	IntegratedHeuristic
}

export class CellSearchData {

    public visited =  false;
    public g = Infinity;
    public h = Infinity;

	constructor( public readonly weight: number) { }

    public get f() {
        return this.g + (this.weight * this.h);
    }
}

export class SearchResult {

  constructor (public readonly grid: Grid, public readonly cellsInPath: { [id: number]: Cell }, public readonly startAndGoalCells: [Cell, Cell], public readonly expanded: number, 
  			   public readonly getCellSearchData: (cell: Cell) => CellSearchData) { }
}

class CellSet {

	private hashTable: { [id: number]: boolean } = {};

	public push(cell: Cell) {
		this.hashTable[cell.id] = true;
	}

	public containsCell(cell: Cell) {
		const value = this.hashTable[cell.id];

		if (value) {
			return true;
		}

		return false;
	}
}

export class Search {

    private grid: Grid;
    private startCell: Cell;
	private startCellData: CellSearchData;

    private goalCell: Cell;

	expanded: number;
	
    private closedSet = new CellSet();
	private openCellsCellData: { [id: number] : CellSearchData } = {};

	private openHeap = new BinaryMinHeap<Cell>(cell => cell.id);
	
    constructor(grid: Grid, start: Cell, goal: Cell) {
        this.grid = grid;
        this.startCell = start;
        this.goalCell = goal;
		this.expanded = 0;
    }

    initiateSearch(type: SearchType, weight: number) {
		
		if (type === SearchType.AStar) {
			weight = 1;
		}

		this.startCellData = new CellSearchData(weight);
		
		this.openCellsCellData[this.startCell.id] = this.startCellData;

        this.startCellData.g = 0;

		let startPriority = 0;
		if (type === SearchType.AStar || type === SearchType.WeightedAStar) {
			startPriority = this.startCellData.f;
		} else {
			startPriority = this.startCellData.g;
		}

		this.openHeap.push(this.startCell, startPriority);
		const cameFrom: { [id: number]: Cell } = {};
		const path: { [id: number]: Cell } = {};

        while (this.openHeap.count > 0) {
			const currentCell = this.openHeap.pop();
			const currentCellData = this.openCellsCellData[currentCell.id];
			// End case -- result has been found, return the traced path
			if (currentCell == this.goalCell) {
				const keys = Object.keys(cameFrom);
				delete cameFrom[this.startCell.id]; 
				let cell = currentCell;
				while ((cell = cameFrom[cell.id])) {
					path[cell.id] = cell
				}

				const self = this;
				const getCellData = function(cell: Cell) {
					let data = self.openCellsCellData[cell.id]
					if (!data) {
						data = new CellSearchData(weight);
						data.h = self.grid.getChebyshevDistance(self.goalCell, cell);
					}
					return data;
				};

				const searchResult = new SearchResult(this.grid, path, [this.startCell, this.goalCell], this.expanded, getCellData);
				return searchResult;
			}

			if (!this.closedSet.containsCell(currentCell)) {
				this.closedSet.push(currentCell);
			}
            
            const neighbors = new Array<[Direction, Cell]>();
            const availableDirections = currentCell.availableDirections;
        
            for (let i=0; i<availableDirections.length; i++){
				const direction = availableDirections[i];
                neighbors.push([direction, currentCell.getNeigbor(direction)]);
            }

 
			for (let i=0; i<neighbors.length; i++) {
				const directionAndNeighbor = neighbors[i];
				this.expanded = this.expanded + 1;

				if (this.closedSet.containsCell(directionAndNeighbor[1])) {
					continue;
				}

				const tentativeGCost = currentCellData.g + currentCell.getMovementCost(directionAndNeighbor[0]);

				const cellData = this.openCellsCellData[directionAndNeighbor[1].id];
 
				if (!cellData || tentativeGCost < cellData.g) {
					
					cameFrom[directionAndNeighbor[1].id] = currentCell;

					const neighborCellData = new CellSearchData(weight);
					this.openCellsCellData[directionAndNeighbor[1].id] = neighborCellData;

					neighborCellData.g = tentativeGCost;
					neighborCellData.h = this.grid.getChebyshevDistance(directionAndNeighbor[1], this.goalCell);
					
					if (!cellData) {
						let priority = 0;
						if (type === SearchType.AStar || type === SearchType.WeightedAStar) {
							priority = neighborCellData.f;
						} else {
							priority = neighborCellData.g;
						}
						this.openHeap.push(directionAndNeighbor[1], priority)
					} 
				}
			}
        }
		debugger;
    }
}