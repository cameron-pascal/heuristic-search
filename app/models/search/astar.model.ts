import { Grid } from '../grid.model';
import { Cell } from '../cell.model';
import { Direction } from '../cell.model';
import { CellType} from '../cell.model';


export class search {

    private grid: Grid;
    private start: Cell;
    private end: Cell;

    private openList: Array<Cell>; //Fringe
    private closedList: Array<Cell>;

    constructor(grid: Grid, start: Cell, end: Cell) {
        this.grid = grid;
        this.start = start;
        this.end = end;
        this.openList = new Array<Cell>();
        this.closedList = new Array<Cell>();
    }

    initiateSearch() {
        // The set of nodes already evaluated.
        // The set of currently discovered nodes that are already evaluated.
        // Initially, only the start node is known.
        this.start.parent = this.start;
        this.start.g = 0;
        this.start.f = this.start.h + this.start.g;
        this.openList.push(this.start);
        // For each node, which node it can most efficiently be reached from.
        // If a node can be reached from many nodes, cameFrom will eventually contain the
        // most efficient previous step.
        while (this.openList.length > 0){
            // Grab the lowest f(x) to process next
		//	let lowInd = 0;
		//	for(let i=0; i< this.openList.length; i++) {
		//		if(this.openList[i].f < this.openList[lowInd].f) { 
          //          lowInd = i; 
            //    }
		//	}
			let currentNode = this.openList.pop();
 
			// End case -- result has been found, return the traced path
			if(currentNode == this.end) {
				let curr = currentNode;
				let ret = new Array<Cell>();
				while(curr.parent) {
					ret.push(curr);
					curr = curr.parent;
				}
				return ret.reverse();
			}

            // Normal case -- move currentNode from open to closed, process each of its neighbors
			// this.openList.pop(); //!!!!!!
			this.closedList.push(currentNode);
            
            let neighbors = new Array<[Direction, Cell]>();
            let availableDirections = currentNode.availableDirections;
        
            for (let Direction of availableDirections){
                neighbors.push([Direction, currentNode.getNeigbor(Direction)]);
            }

 
			for(var i=0; i<neighbors.length;i++) {
				let neighbor = neighbors[i];

				if(this.closedList.indexOf(neighbor[1]) != -1 || neighbor[1].cellType == CellType.Blocked) {
					// not a valid node to process, skip to next neighbor
					continue;
				}
 
				// g score is the shortest distance from start to current node, we need to check if
				//	 the path we have arrived at this neighbor is the shortest one we have seen yet

				let gScore = currentNode.g + currentNode.getCost(neighbor[0]); 
				let gScoreIsBest = false;
				let beenVisited = neighbor[1].visited;
 
				//if(this.closedList.indexOf(currentNode))
 
				/*if(this.openList.indexOf(neighbor[1]) == -1) {
					// This the the first time we have arrived at this node, it must be the best
					// Also, we need to take the h (heuristic) score since we haven't done so yet
					gScoreIsBest = true;
					//neighbor.h = astar.heuristic(neighbor.pos, end.pos);
					this.openList.push(neighbor[1]);
				}*/
				if(!beenVisited  || gScore < neighbor[1].g) {
					// We have already seen the node, but last time it had a worse g (distance from start)
					gScoreIsBest = true;
					neighbor[1].parent = currentNode;
					neighbor[1].visited = true;
					neighbor[1].g = gScore + neighbor[1].getCost(neighbor[0]);
					neighbor[1].f = neighbor[1].g + neighbor[1].h;
					console.log("neighbor : " , neighbor[1].id)
					console.log("h : " , neighbor[1].h)
					if(!beenVisited){
						this.openList.push(neighbor[1])
					} else {
						let i = this.openList.indexOf(neighbor[1]);
						this.openList.sort((a, b) => {
							return a.f - b.f;
						})
					}

				}

			}
        }
    }
}