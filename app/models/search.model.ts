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

	private _g = Infinity;
	private _h = Infinity;
	private _weight = 1;

	public set g(val: number) {
		this._g = val;
	}
	public set h(val: number) {
		this._h = val;
	}

	public  get g() {
		return this._g;
	}

	public  get h() {
		return this._h;
	}

	public  get f() {
		return this._g + (this._weight * this._h);
	}

	constructor(weight?: number) {
		if (weight) {
			this._weight = weight;
		}
	}

	public visited = false;
}

class MultiHeuristicCellSearchData extends CellSearchData {

	public gList = new Array<number>();
	public hList = new Array<number>();
	public backPointerList = new Array<Cell>();

	public h = 0;
	public g = 0;
	public v = 0;
	public backPointer: Cell;

	MultiHeuristicCellSearchData(){
		this.backPointer = null;
	}


    public get f() {
        return this.gList[0] + this.hList[0];
    }

	public getHeuristics(grid: Grid, currentCell: Cell, endCell: Cell){
		this.hList.push(grid.getChebyshevDistance(currentCell, endCell));
		this.hList.push(grid.getEuclidianDistance(currentCell, endCell));
		this.hList.push(Math.pow(grid.getEuclidianDistance(currentCell, endCell), 2));
		this.hList.push(grid.getManhattanDistance(currentCell, endCell));
		this.hList.push(grid.getOctileDistance(currentCell, endCell));
	}
}

export class SearchResult {

  constructor (public readonly grid: Grid, public readonly cellsInPath: { [id: number]: Cell }, public readonly startAndGoalCells: [Cell, Cell], public readonly expanded: number, 
  			   public readonly getCellSearchData: (cell: Cell) => CellSearchData, public readonly length: number) { }
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

abstract class SearchRunner {

	protected expanded = 0;
	
	public get expandedCells() {
		return this.expanded;
	}

	constructor(protected readonly grid: Grid, protected readonly startCell: Cell, protected readonly goalCell: Cell) { }

	public abstract runSearch(): SearchResult; 
}

class SingleHeuristicSearchRunner extends SearchRunner {

	private closedSet = new CellSet();
	private openCellsCellData: { [id: number] : CellSearchData } = {};
	private openHeap = new BinaryMinHeap<Cell>(cell => cell.id);
	private startCellData: CellSearchData;
	private totalLength = 0;

	constructor(grid: Grid, startCell: Cell, goalCell: Cell, private readonly weight: number, private readonly type: SearchType) {
		super(grid, startCell, goalCell);
	}

	runSearch() {

		const hWeight = (this.type === SearchType.AStar) ? 1 : this.weight;
		
		this.startCellData = new CellSearchData(hWeight);
		
		this.openCellsCellData[this.startCell.id] = this.startCellData;

        this.startCellData.g = 0;

		let startPriority = 0;
		if (this.type === SearchType.AStar || this.type === SearchType.WeightedAStar) {
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
				this.totalLength = this.openCellsCellData[cameFrom[cell.id].id].g;
				while ((cell = cameFrom[cell.id])) {
					path[cell.id] = cell
				}

				const self = this;
				const getCellData = function(cell: Cell) {
					let data = self.openCellsCellData[cell.id]
					if (!data) {
						data = new CellSearchData(hWeight);
						data.h = self.grid.getChebyshevDistance(self.goalCell, cell);
					}
					return data;
				};

				const searchResult = new SearchResult(this.grid, path, [this.startCell, this.goalCell], this.expanded, getCellData, this.totalLength);
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
				this.expanded++;

				if (this.closedSet.containsCell(directionAndNeighbor[1])) {
					continue;
				}

				const tentativeGCost = currentCellData.g + currentCell.getMovementCost(directionAndNeighbor[0]);

				const cellData = this.openCellsCellData[directionAndNeighbor[1].id];
 
				if (!cellData || tentativeGCost < cellData.g) {
					
					cameFrom[directionAndNeighbor[1].id] = currentCell;

					const neighborCellData = new CellSearchData(hWeight);
					this.openCellsCellData[directionAndNeighbor[1].id] = neighborCellData;

					neighborCellData.g = tentativeGCost;
					neighborCellData.h = this.grid.getChebyshevDistance(directionAndNeighbor[1], this.goalCell);
					
					if (!cellData) {
						let priority = 0;
						if (this.type === SearchType.AStar || this.type === SearchType.WeightedAStar) {
							priority = neighborCellData.f;
						} else {
							priority = neighborCellData.g;
						}
						this.openHeap.push(directionAndNeighbor[1], priority)
					} 
				}
			}
        }
    }
}

class SequentialHeuristicSearchRunner extends SearchRunner {

	private openHeapList = new Array<BinaryMinHeap<Cell>>();
	private closedSetList = new Array<CellSet>();
	private openCellsCellData: { [id: number] : MultiHeuristicCellSearchData } = {};
	private totalLength = 0;

	constructor(grid: Grid, startCell: Cell, goalCell: Cell) {
		super(grid, startCell, goalCell);

		for (let i=0; i<5; i++) {
			this.openHeapList.push(new BinaryMinHeap<Cell>(cell => cell.id));
			this.closedSetList.push(new CellSet());
		}
	}
	
	private key(s: Cell, index: number) {
		const cellData = this.openCellsCellData[s.id];
		cellData.getHeuristics(this.grid, s, this.goalCell);
		return cellData.gList[index] + 1.25 * cellData.hList[index];
	}

	private expandState(s:Cell, index:number) {
		const neighbors = new Array<[Direction, Cell]>();
		const availableDirections = s.availableDirections;
        
		for (let i=0; i<availableDirections.length; i++){
			const direction = availableDirections[i];
			neighbors.push([direction, s.getNeigbor(direction)]);
		}

 
		for (let i=0; i<neighbors.length; i++) {
			const directionAndNeighbor = neighbors[i];
			this.expanded++;
			const a = this.openCellsCellData[directionAndNeighbor[1].id];
			
			if (!a) {
				const currCellData = new MultiHeuristicCellSearchData();
				currCellData.gList[index] = Infinity;
				currCellData.backPointerList[index] = null;
				this.openCellsCellData[directionAndNeighbor[1].id] = currCellData;
			}

			if (this.openCellsCellData[directionAndNeighbor[1].id].gList[index] > (this.openCellsCellData[s.id].gList[index] + s.getMovementCost(directionAndNeighbor[0]))) {
				this.openCellsCellData[directionAndNeighbor[1].id].gList[index] = this.openCellsCellData[s.id].gList[index] + s.getMovementCost(directionAndNeighbor[0]);
				this.openCellsCellData[directionAndNeighbor[1].id].backPointerList[index] = s;
				if (!this.closedSetList[index].containsCell(directionAndNeighbor[1])){
					this.openHeapList[index].push(directionAndNeighbor[1], this.key(directionAndNeighbor[1], index));
				}
			}
		}
	}

	public runSearch() {

		for (let i = 0; i < 5; i++) {
			const startCellData = new MultiHeuristicCellSearchData();
			startCellData.gList[i] = 0;
			startCellData.backPointerList[i] = this.startCell;
			
			const goalCellData = new MultiHeuristicCellSearchData();
			goalCellData.gList[i] = Infinity;
			goalCellData.backPointerList[i] = null;

			this.openCellsCellData[this.startCell.id] = startCellData;
			this.openCellsCellData[this.goalCell.id] = goalCellData;

			this.openHeapList[i].push(this.startCell, this.key(this.startCell, i));

			while (this.openHeapList[0].peekPriority() < Infinity) {
				
				for (let i = 1; i < 5; i++) {	
					if (this.openHeapList[i].count > 0) {
						
						if (this.openHeapList[i].peekPriority() <= (1.5 * this.openHeapList[0].peekPriority())) {
							
							if (this.openCellsCellData[this.goalCell.id].gList[i] <= this.openHeapList[i].peekPriority()) {
								
								if (this.openCellsCellData[this.goalCell.id].gList[i] <= Infinity){
									
									let currCell = this.goalCell;
									this.totalLength = this.openCellsCellData[this.openCellsCellData[currCell.id].backPointerList[i].id].gList[i];
									
									const path: { [id: number]: Cell } = {};
									
									while (currCell != this.startCell) {
										path[currCell.id] = currCell;
										currCell = this.openCellsCellData[currCell.id].backPointerList[i];
									}

									const self = this;
									const getCellData = function(cell: Cell) {
										let data = self.openCellsCellData[cell.id]
										
										if (!data) {
											data = new MultiHeuristicCellSearchData();
											data.h = self.grid.getChebyshevDistance(self.goalCell, cell);
										}

										return data;
									};
									
									const searchResult = new SearchResult(this.grid, path, [this.startCell, this.goalCell], this.expanded, getCellData, this.totalLength);
									return searchResult;
								}
							}
						} else {
							let currentCell = this.openHeapList[i].pop();
							this.expandState(currentCell, i);
							this.closedSetList[i].push(currentCell);
						}
					} else {
						if (this.openHeapList[0].count > 0) {
							if (this.openCellsCellData[this.goalCell.id].gList[0] <= this.openHeapList[0].peekPriority()) {
								if (this.openCellsCellData[this.goalCell.id].gList[0] <= Infinity) {
									let currCell = this.goalCell;
									const path: { [id: number]: Cell } = {};
									this.totalLength = this.openCellsCellData[this.openCellsCellData[currCell.id].backPointerList[0].id].gList[0];
									while (currCell != this.startCell){
										path[currCell.id] = currCell;
										currCell = this.openCellsCellData[currCell.id].backPointerList[0];
									}
									const self = this;
									const getCellData = function(cell: Cell) {
										let data = self.openCellsCellData[cell.id]
										if (!data) {
											data = new MultiHeuristicCellSearchData();
											data.h = self.grid.getChebyshevDistance(self.goalCell, cell);
										}
										return data;
									};
									const searchResult = new SearchResult(this.grid, path, [this.startCell, this.goalCell], this.expanded, getCellData, this.totalLength);
									return searchResult;
								}
							} else {
								let currentCell = this.openHeapList[0].pop();
								this.expandState(currentCell, 0);
								this.closedSetList[0].push(currentCell);
							}
						}
					}
				}
			}
		}
	}
}

class IntegratedHeuristicSearchRunner extends SearchRunner {

	private openHeapList = new Array<BinaryMinHeap<Cell>>();
	private closedSetList = new Array<CellSet>();
	private openCellsCellData: { [id: number] : MultiHeuristicCellSearchData } = {};

	private closedListAnchor = new CellSet();
	private closedListInad = new CellSet();
	private totalLength = 0;


	constructor(grid: Grid, startCell: Cell, goalCell: Cell) {
		super(grid, startCell, goalCell);

		for (let i=0; i<5; i++) {
			this.openHeapList.push(new BinaryMinHeap<Cell>(cell => cell.id));
			this.closedSetList.push(new CellSet());
		}
	}
	
	private key(s: Cell, index: number) {
		const cellData = this.openCellsCellData[s.id];
		cellData.getHeuristics(this.grid, s, this.goalCell);
		return cellData.g + 1.25 * cellData.hList[index];
	}

	private expandState(s:Cell, index: number) {
		this.openCellsCellData[s.id].v = this.openCellsCellData[s.id].g;

		const neighbors = new Array<[Direction, Cell]>();
		const availableDirections = s.availableDirections;
        
		for (let i=0; i<availableDirections.length; i++){
			const direction = availableDirections[i];
			neighbors.push([direction, s.getNeigbor(direction)]);
		}

 
		for (let i=0; i<neighbors.length; i++) {
			const directionAndNeighbor = neighbors[i];
			this.expanded++;
			const a = this.openCellsCellData[directionAndNeighbor[1].id];
			
			if (!a) {
				const currCellData = new MultiHeuristicCellSearchData();
				currCellData.g = Infinity;
				currCellData.backPointer = null;
				currCellData.v = Infinity;
				this.openCellsCellData[directionAndNeighbor[1].id] = currCellData;
			}
			if (this.openCellsCellData[directionAndNeighbor[1].id].g > (this.openCellsCellData[s.id].g + s.getMovementCost(directionAndNeighbor[0]))) {
				this.openCellsCellData[directionAndNeighbor[1].id].g = this.openCellsCellData[s.id].g + s.getMovementCost(directionAndNeighbor[0]);
				this.openCellsCellData[directionAndNeighbor[1].id].backPointer = s;
				if (!this.closedListAnchor.containsCell(directionAndNeighbor[1])){
					this.openHeapList[0].push(directionAndNeighbor[1], this.key(directionAndNeighbor[1], 0));
					if(!this.closedListInad.containsCell(directionAndNeighbor[1])){
						for(let i = 1; i < 5; i++){
							if (this.key(directionAndNeighbor[1], i) <= (1.5 * this.key(directionAndNeighbor[1], 0))){
								this.openHeapList[i].push(directionAndNeighbor[1], this.key(directionAndNeighbor[1], i));
							}
						}
					}
					
				}
			}
		}
	}

	public runSearch() {
			const startCellData = new MultiHeuristicCellSearchData();
			startCellData.g = 0;
			startCellData.backPointer = this.startCell;
			
			const goalCellData = new MultiHeuristicCellSearchData();
			goalCellData.g = Infinity;
			goalCellData.backPointer = null;

			this.openCellsCellData[this.startCell.id] = startCellData;
			this.openCellsCellData[this.goalCell.id] = goalCellData;
			
			//what is U?
			for (let i = 0; i < 5; i++) {	
				this.openHeapList[i].push(this.startCell, this.key(this.startCell, i));
			}

			while (this.openHeapList[0].peekPriority() < Infinity) {
				for (let i = 1; i < 5; i++){
					if(this.openHeapList[i].peekPriority() <= (1.5 * this.openHeapList[0].peekPriority())){ 
						if(this.openCellsCellData[this.goalCell.id].g <= this.openHeapList[i].peekPriority()){
							if (this.openCellsCellData[this.goalCell.id].g < Infinity){
									let currCell = this.goalCell;
									const path: { [id: number]: Cell } = {};
									this.totalLength = this.openCellsCellData[this.openCellsCellData[currCell.id].backPointer.id].g;
									while (currCell != this.startCell){
										path[currCell.id] = currCell;
										currCell = this.openCellsCellData[currCell.id].backPointer;
									}
									const self = this;
									const getCellData = function(cell: Cell) {
										let data = self.openCellsCellData[cell.id]
										if (!data) {
											data = new MultiHeuristicCellSearchData();
											data.h = self.grid.getChebyshevDistance(self.goalCell, cell);
										}
										return data;
									};
									const searchResult = new SearchResult(this.grid, path, [this.startCell, this.goalCell], this.expanded, getCellData, this.totalLength);
									return searchResult;
							}
						} else {
							let currentCell = this.openHeapList[i].pop();
							this.expandState(currentCell, 0);
							this.closedListInad.push(currentCell);
						}
					} else {
						if (this.openCellsCellData[this.goalCell.id].g <= this.openHeapList[0].peekPriority()) {
								if (this.openCellsCellData[this.goalCell.id].g <= Infinity) {
									let currCell = this.goalCell;
									const path: { [id: number]: Cell } = {};
									this.totalLength = this.openCellsCellData[this.openCellsCellData[currCell.id].backPointer.id].g;
									while (currCell != this.startCell){
										path[currCell.id] = currCell;
										currCell = this.openCellsCellData[currCell.id].backPointer;
									}
									const self = this;
									const getCellData = function(cell: Cell) {
										let data = self.openCellsCellData[cell.id]
										if (!data) {
											data = new MultiHeuristicCellSearchData();
											data.h = self.grid.getChebyshevDistance(self.goalCell, cell);
										}
										return data;
									};
									const searchResult = new SearchResult(this.grid, path, [this.startCell, this.goalCell], this.expanded, getCellData, this.totalLength);
									return searchResult;
								}
						} else {
								let currentCell = this.openHeapList[0].pop();
								this.expandState(currentCell, 0);
								this.closedListAnchor.push(currentCell);
						}

					}
				}
			}
	}
	
}

export class Search {

	private searchRunner: SearchRunner;

    constructor(private readonly grid: Grid, private readonly start: Cell, private readonly goal: Cell) { }

	initiateSearch(type: SearchType, weight: number) {
		
		if (type === SearchType.SequentialHeuristic) {
			this.searchRunner = new SequentialHeuristicSearchRunner(this.grid, this.start, this.goal);
		} else if (type === SearchType.IntegratedHeuristic){
			this.searchRunner = new IntegratedHeuristicSearchRunner(this.grid, this.start, this.goal);
		}

		this.searchRunner = new SingleHeuristicSearchRunner(this.grid, this.start, this.goal, weight, type);

		return this.searchRunner.runSearch();
	}
}