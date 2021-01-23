import * as geom from 'tiled-geometry';

/**
 * For each number in the _tileFlags array, we store (1 << FLAGS_POW2) cells,
 * as bits where a true indicates the presence of a body.
 */
const FLAGS_POW2 = 5;

/**
 * The FieldOfViewMap class describes the map over which the field of view will be
 * computed.  It starts empty.
 */
export class FieldOfViewMap {
    private readonly _size = new geom.Size();
    private readonly _tileFlags: number[];

    constructor(width: number, height: number) {
        this._size.set(width, height);
        this._tileFlags = new Array<number>((this._size.area >> FLAGS_POW2) + 1).fill(0);
    }

    get width(): number {
        return this._size.width;
    }

    get height(): number {
        return this._size.height;
    }

    // bodies

    addBody(x: number, y: number): this {
        if (this._size.contains(x, y)) {
            const index = this.index(x, y);
            this._tileFlags[index >> FLAGS_POW2] |= 1 << (index & ((1 << FLAGS_POW2) - 1));
        }
        return this;
    }

    removeBody(x: number, y: number): this {
        if (this._size.contains(x, y)) {
            const index = this.index(x, y);
            this._tileFlags[index >> FLAGS_POW2] &= ~(1 << (index & ((1 << FLAGS_POW2) - 1)));
        }
        return this;
    }

    getBody(x: number, y: number): boolean {
        const index = this.index(x, y);
        return this.getBodyAtIndex(index);
    }

    // internal

    index(x: number, y: number): number {
        return this._size.index(x, y);
    }

    getBodyAtIndex(index: number): boolean {
        return (this._tileFlags[index >> FLAGS_POW2] & (1 << (index & ((1 << FLAGS_POW2) - 1)))) !== 0;
    }
}
