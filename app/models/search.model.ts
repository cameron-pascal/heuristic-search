import { Grid } from './grid.model';
import { Cell } from './cell.model';
import { Direction } from './cell.model';
import { CellType} from './cell.model';
import { BinaryMinHeap} from './binaryMinHeap.model';

export enum SearchType {
    AStar,
    WeightedAStar,
    Uniformed,
	SequentialHeuristic
}

export class CellSearchData {

    public visited =  false;
    public g = Infinity;
	public gList = new Array<number>();
    public h = Infinity;
	public hList = new Array<number>();
	public backPointerList = new Array<Cell>();

	constructor( public readonly weight: number) { }

    public get f() {
        return this.g + (this.weight * this.h);
    }

	public getHeuristics(grid: Grid, currentCell: Cell, endCell: Cell){
		this.hList.push(grid.getChebyshevDistance(currentCell, endCell));
		this.hList.push(grid.getEuclidianDistance(currentCell, endCell));
		this.hList.push(Math.pow(grid.getEuclidianDistance(currentCell, endCell), 2));
		this.hList.push(10);
		this.hList.push(9);
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

	private openHeapList: Array<BinaryMinHeap<Cell>>;
	private closedSetList: Array<CellSet>;
	private bestPath: Array<Cell>;
	
    constructor(grid: Grid, start: Cell, goal: Cell) {
        this.grid = grid;
        this.startCell = start;
        this.goalCell = goal;
		this.expanded = 0;

		this.openHeapList = new Array<BinaryMinHeap<Cell>>();
		this.closedSetList = new Array<CellSet>();
		this.bestPath = new Array<Cell>();
	
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

	key(s:Cell, index:number){
		const cellData = this.openCellsCellData[s.id];
		cellData.getHeuristics(this.grid, s, this.goalCell);
		return cellData.gList[index] + 1.5 * cellData.hList[index];
	}

	ExpandState(s:Cell, index:number){

		  const neighbors = new Array<[Direction, Cell]>();
            const availableDirections = s.availableDirections;
        
            for (let i=0; i<availableDirections.length; i++){
				const direction = availableDirections[i];
                neighbors.push([direction, s.getNeigbor(direction)]);
            }

 
			for (let i=0; i<neighbors.length; i++) {
				const directionAndNeighbor = neighbors[i];
				this.expanded = this.expanded + 1;
				const a = this.openCellsCellData[directionAndNeighbor[1].id];
				if (!a) {
					const currCellData = new CellSearchData(1);
					currCellData.gList[index] = Infinity;
					currCellData.backPointerList[index] = null;
					this.openCellsCellData[directionAndNeighbor[1].id] = currCellData;
				}
				if (this.openCellsCellData[directionAndNeighbor[1].id].gList[index] > (this.openCellsCellData[s.id].gList[index] + s.getMovementCost(directionAndNeighbor[0]))) {

					this.openCellsCellData[directionAndNeighbor[1].id].gList[index] = this.openCellsCellData[s.id].gList[index] + s.getMovementCost(directionAndNeighbor[0]);
					this.openCellsCellData[directionAndNeighbor[1].id].backPointerList[index] = s;
					if (this.closedSetList[index].containsCell(directionAndNeighbor[1])){
						this.openHeapList[index].push(directionAndNeighbor[1], this.key(directionAndNeighbor[1], index));
					}
				}
			}

	}
	multiHeuristicSearch(){
		for (let i = 0; i < 5; i++){
		 	let heap = new BinaryMinHeap<Cell>(cell => cell.id);
			this.openHeapList.push(heap);
			
			 let closeSet = new CellSet();
			 this.closedSetList.push(closeSet);

			 const startCellData = new CellSearchData(1);
			startCellData.gList[i] = 0;
			startCellData.backPointerList[i] = this.startCell;
			
			 const goalCellData = new CellSearchData(1);
			goalCellData.gList[i] = 0;
			goalCellData.backPointerList[i] = null;

			this.openCellsCellData[this.startCell.id] = startCellData;
			this.openCellsCellData[this.goalCell.id] = goalCellData;

			this.openHeapList[i].push(this.startCell, this.key(this.startCell, i));

			while (this.openHeapList[0].peekPriority() < Infinity){
				for (let i = 1; i < 5; i++){
					if (this.openHeapList[i].peekPriority() <= (2.0 * this.openHeapList[0].peekPriority())){
						if (this.openCellsCellData[this.goalCell.id].gList[i] <= this.openHeapList[i].peekPriority()){
							if (this.openCellsCellData[this.goalCell.id].gList[i] <= Infinity){
								let currCell = this.goalCell;
								const path: { [id: number]: Cell } = {};
								while (currCell != this.startCell){
									path[currCell.id] = currCell;
									currCell = this.openCellsCellData[currCell.id].backPointerList[i];
								}
								return;
							}
						} else {
							let currentCell = this.openHeapList[i].pop();
							this.ExpandState(currentCell, i);
							this.closedSetList[i].push(currentCell);
						}
					} else {
						if (this.openCellsCellData[this.goalCell.id].gList[0] <= this.openHeapList[0].peekPriority())
						{
							if (this.openCellsCellData[this.goalCell.id].gList[0] <= Infinity){
								let currCell = this.goalCell;
								const path: { [id: number]: Cell } = {};
								while (currCell != this.startCell){
									path[currCell.id] = currCell;
									currCell = this.openCellsCellData[currCell.id].backPointerList[0];
								}
								return;
							}
						} else {
							let currentCell = this.openHeapList[0].pop();
							this.ExpandState(currentCell, 0);
							this.closedSetList[0].push(currentCell);
						}
					}
				
				
				}

			}



			
			 



		}
	}
}