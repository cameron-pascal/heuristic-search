export abstract class PriorityQueue<T> {

    constructor() {
    }

    abstract pop(): T;

    abstract push(item: T, priorty: number): void;
}