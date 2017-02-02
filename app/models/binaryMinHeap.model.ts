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
<<<<<<< HEAD
            //this._nodeHash[this._hashFunc(item)] = true;
=======
            this._nodeHash[this._hashFunc(item)] = true;
>>>>>>> 09f14f3e6dbc6bbee90a616ceb7584036469a78e
            this.upHeap(this._nodes.length - 1);
            return true;
        }

        return false;
    }

    public pop() {
<<<<<<< HEAD
        const result = this._nodes[0];
        const largest = this._nodes.pop();

        if (this._nodes.length > 0) {
            this._nodes[0] = largest;
            this.downHeap(0);
        }

        return result.item;
=======
        if (this._nodes.length > 0) {
            const root = this._nodes[0];
            this._nodeHash[this._hashFunc(root.item)] = false;
            this._nodes[0] = this._nodes[this._nodes.length - 1];
            this._nodes.splice(this._nodes.length - 1, 1);
            this.downHeap(0);
            return root.item;
        }

        return null;
>>>>>>> 09f14f3e6dbc6bbee90a616ceb7584036469a78e
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
<<<<<<< HEAD
            const item = items[i][0];
            const priority = items[i][1];
            const hashCode = this._hashFunc(item);
            //this._nodeHash[hashCode] = true;
            this._nodes[i] = new HeapNode(item, priority);
        }

        for (let i = Math.floor(items.length / 2); i >= 0; i--) {
            this.downHeap(i);   
=======
            this._nodes[i] = new HeapNode(items[i][0], items[i][1]);
        }

        for (let i = Math.floor((items.length - 1) / 2); i <= 0; i--) {
            this.upHeap(i);   
>>>>>>> 09f14f3e6dbc6bbee90a616ceb7584036469a78e
        }
    }

    private downHeap(index: number) {
<<<<<<< HEAD
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
=======
        if (index < this._nodes.length) {
            let minChildIndex = this.getMinChildIndex(index);

            while (minChildIndex >= 0 && this._nodes[minChildIndex] > this._nodes[index]) {
                this.swap(index, minChildIndex);
                index = minChildIndex;
                minChildIndex = this.getMinChildIndex(index);
            }
>>>>>>> 09f14f3e6dbc6bbee90a616ceb7584036469a78e
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

<<<<<<< HEAD
=======
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

>>>>>>> 09f14f3e6dbc6bbee90a616ceb7584036469a78e
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