export interface OffsetLike {
    readonly x: number;
    readonly y: number;
}

export class Offset implements OffsetLike {
    x: number;
    y: number;

    constructor();
    constructor(x: number, y: number);
    constructor(x?: number, y?: number) {
        if (typeof x === 'undefined') {
            x = 0;
        }
        if (typeof y === 'undefined') {
            y = 0;
        }
        this.x = x;
        this.y = y;
    }

    toString() {
        return `(${this.x},${this.y})`;
    }

    // mutators

    set(x: number, y: number) {
        this.x = x;
        this.y = y;
        return this;
    }

    copyFrom(other: OffsetLike) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    addOffset(off: OffsetLike) {
        this.x += off.x;
        this.y += off.y;
        return this;
    }

    subtractOffset(off: OffsetLike) {
        this.x -= off.x;
        this.y -= off.y;
        return this;
    }
}