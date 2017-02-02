import { PriorityQueue } from './priorityQueue.model';

class HeapNode<T> {
    
    constructor(public readonly item: T, public readonly priority: number) { }
}

export class BinaryMinHeap<T> implements PriorityQueue<T> {

    private _nodes: Array<HeapNode<T>>;
    private _nodeHash: { [key: number]: boolean } = {};

    constructor(private readonly _hashFunc: (item: T) => number, items?: Array<[T, number]>) {
        if (items !== null) {
            this._nodes = new Array<HeapNode<T>>(items.length);
            this.buildHeap(items);
        } else {
            this._nodes = new Array<HeapNode<T>>();
        }
     }

    public get count() {
        return this._nodes.length;
    }

    public push(item: T, priority: number) {
        if (item !== null || typeof item !== 'undefined') {
            this._nodes.push(new HeapNode<T>(item, priority));
            //this._nodeHash[this._hashFunc(item)] = true;
            this.upHeap(this._nodes.length - 1);
            return true;
        }

        return false;
    }

    public pop() {
        const result = this._nodes[0];
        const largest = this._nodes.pop();

        if (this._nodes.length > 0) {
            this._nodes[0] = largest;
            this.downHeap(0);
        }

        return result.item;
    }

    public contains(item: T) {
        const result = this._nodeHash[this._hashFunc(item)];

        if (typeof result === 'undefined') {
            return false;
        }

        return result;
    }

    private buildHeap(items: Array<[T, number]>) {
        for (let i = 0; i < items.length; i++) {
            const item = items[i][0];
            const priority = items[i][1];
            const hashCode = this._hashFunc(item);
            //this._nodeHash[hashCode] = true;
            this._nodes[i] = new HeapNode(item, priority);
        }

        for (let i = Math.floor(items.length / 2); i >= 0; i--) {
            this.downHeap(i);   
        }
    }

    private downHeap(index: number) {
        const leftChildIndex = this.getLeftChildIndex(index);
        const rightChildIndex = this.getRightChildIndex(index);
        let minChildIndex = index;
            
        if (leftChildIndex < this._nodes.length && (this._nodes[leftChildIndex].priority < this._nodes[minChildIndex].priority)) {
            minChildIndex = leftChildIndex;
        }

        if (rightChildIndex <  this._nodes.length && (this._nodes[rightChildIndex].priority < this._nodes[minChildIndex].priority)) {
            minChildIndex = rightChildIndex;
        }

        if (minChildIndex !== index) {
            this.swap(minChildIndex, index);
            this.downHeap(minChildIndex);
        }
    }
    
    private upHeap(index: number) {
        if (index > 0) {
            const item = this._nodes[index];
            const parentIndex = this.getParentIndex(index);
            const parent = this._nodes[parentIndex];

            if (parent.priority > item.priority) {
                this.swap(parentIndex, index);
                this.upHeap(parentIndex);
            }
        }
    }

    private getLeftChildIndex(index: number) {
        return (2 * index) + 1;
    }

    private getRightChildIndex(index: number) {
        return (2 * index) + 2;
    }

    private getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    private swap(i: number, j: number) {
        let temp = this._nodes[i];
        this._nodes[i] = this._nodes[j];
        this._nodes[j] = temp;
    }
}