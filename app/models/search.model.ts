import { Grid } from './grid.model';
import { Cell } from './cell.model';
import { Direction } from './cell.model';
import { CellType} from './cell.model';
import { BinaryMinHeap} from './binaryMinHeap.model';

export enum SearchType {
    AStar,
    WeightedAStar,
    Uniformed
}

export class SearchResult {
  constructor (public readonly grid: Grid, public readonly path: Array<Cell>, public readonly startAndGoalCells: [Cell, Cell], public readonly expanded: number, public readonly length: number) { }
}

export class Search {

    private grid: Grid;
    private start: Cell;
    private end: Cell;

	expanded: number;
	
    private closedList: Array<Cell>;

	private openHeap: BinaryMinHeap<Cell>;
	private closedHeap: BinaryMinHeap<Cell>;

	private weight: number;

	length: number;


    constructor(grid: Grid, start: Cell, end: Cell) {
        this.grid = grid;
        this.start = start;
        this.end = end;
        this.closedList = new Array<Cell>();
		this.openHeap = new BinaryMinHeap<Cell>(cell => cell.id);
		this.weight = 1.5;
		this.expanded = 0;
		this.length = 0;
    }

    initiateSearch(type: SearchType) {
		console.log("Search");
        this.start.parent = this.start;
        this.start.g = 0;
        this.start.f = this.start.h + this.start.g;
		let priority = 0;
		if (type === SearchType.AStar) {
			priority = this.start.g + this.start.h;
		} else if (type === SearchType.Uniformed) {
			priority = this.start.g;
		} else if (type == SearchType.WeightedAStar) {
			priority = this.start.g + this.start.h * this.weight;
		}
		this.openHeap.push(this.start, priority);

        while (this.openHeap.count > 0) {
			let currentNode = this.openHeap.pop();
 
			// End case -- result has been found, return the traced path
			if (currentNode == this.end) {
				let curr = currentNode;
				let ret = new Array<Cell>();
				this.length = curr.parent.g;
				while(curr.parent !== curr) {
					ret.push(curr);
					curr = curr.parent;
				}
				const searchResult = new SearchResult(this.grid, ret.reverse(), [this.start, this.end], this.expanded, this.length);
				return searchResult;
			}

			if (this.closedList.indexOf(currentNode) < 0) {
				this.closedList.push(currentNode);
			}
            
            let neighbors = new Array<[Direction, Cell]>();
            let availableDirections = currentNode.availableDirections;
        
            for (let Direction of availableDirections){
                neighbors.push([Direction, currentNode.getNeigbor(Direction)]);
            }

 
			for (var i=0; i<neighbors.length;i++) {
				let neighbor = neighbors[i];
				this.expanded = this.expanded + 1;

				if (this.closedList.indexOf(neighbor[1]) >= 0) {
					continue;
				}
				let gScore = currentNode.g + currentNode.getCost(neighbor[0]); 
				let beenVisited = neighbor[1].visited;
 
				if (!beenVisited || gScore < neighbor[1].g) {
					neighbor[1].parent = currentNode;
					neighbor[1].visited = true;
					neighbor[1].g = gScore;
					neighbor[1].f = neighbor[1].g + neighbor[1].h;
					
					if (!beenVisited) {
						let priority = 0;
						if (type === SearchType.AStar) {
							priority = neighbor[1].g + neighbor[1].h;
						} else if (type === SearchType.Uniformed) {
							priority = neighbor[1].g;
						} else if (type == SearchType.WeightedAStar) {
							priority = neighbor[1].g + neighbor[1].h * this.weight;
						}
						this.openHeap.push(neighbor[1], priority)
					} 
				}
			}
        }
    }
}