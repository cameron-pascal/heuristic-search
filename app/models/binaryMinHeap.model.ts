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
            this._nodeHash[this._hashFunc(item)] = true;
            this.upHeap(this._nodes.length - 1);
            return true;
        }

        return false;
    }

    public pop() {
        if (this._nodes.length > 0) {
            const root = this._nodes[0];
            this._nodeHash[this._hashFunc(root.item)] = false;
            this._nodes[0] = this._nodes[this._nodes.length - 1];
            this._nodes.splice(this._nodes.length - 1, 1);
            this.downHeap(0);
            return root.item;
        }

        return null;
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
            this._nodes[i] = new HeapNode(items[i][0], items[i][1]);
        }

        for (let i = Math.floor((items.length - 1) / 2); i <= 0; i--) {
            this.upHeap(i);   
        }
    }

    private downHeap(index: number) {
        if (index < this._nodes.length) {
            let minChildIndex = this.getMinChildIndex(index);

            while (minChildIndex >= 0 && this._nodes[minChildIndex] > this._nodes[index]) {
                this.swap(index, minChildIndex);
                index = minChildIndex;
                minChildIndex = this.getMinChildIndex(index);
            }
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

    private getMinChildIndex(index: number) {
        const leftChildIndex = this.getLeftChildIndex(index);
        const rightChildIndex = this.getRightChildIndex(index);

        if (rightChildIndex >= this._nodes.length) {
            if (leftChildIndex >= this._nodes.length) {
                return -1;
            }

            return leftChildIndex;
        }

        const leftChild = this._nodes[leftChildIndex];
        const rightChild = this._nodes[rightChildIndex];

        if (leftChild.priority < rightChild.priority) {
            return leftChildIndex;
        }

        return rightChildIndex;
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