export class Node<T> {

    private _isVisted: boolean;
    private _parent: Node<T>;

    constructor(public readonly state: T) {

    }

    public visit(parentNode: Node<T>) {
        this._isVisted = true;
        this._parent = parentNode;
    }

    public get isVisited() {
        return this._isVisted;
    }

    public get parent() {
        return this._parent;
    }
}