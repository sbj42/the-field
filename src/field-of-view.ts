import * as geom from './geom';

// tslint:disable:no-bitwise

/**
 * In the shadowcasting algorithm, each shadow is represented by a "wedge",
 * running from a "low" angle to a "high" angle.  The wedges are all stored in
 * a simple number array, with two numbers for each wedge.  These constants
 * (WEDGE_LOW and WEDGE_HIGH) help to identify which number is which.
 * WEDGE_COUNT is just how many numbers per wedge.
 */
const WEDGE_LOW = 0;
const WEDGE_HIGH = 1;
const WEDGE_COUNT = 2;

/**
 * Bodies in this algorithm do not entirely fill their tiles.  This is
 * implemented by adjusting the angles of the shadows the bodies cast,
 * making the wedge very slightly narrower.  BODY_EPSILON represents the
 * amount of reduction on either side of the wedge.
 */
const BODY_EPSILON = 0.00001;

/**
 * We avoid heap allocations during the core part of the algorithm by using this
 * preallocated offset object.
 */
const LOCAL_OFF = new geom.Offset();

/**
 * For each number in the _tileFlags array, we store (1 << FLAGS_POW2) cells,
 * as bits where a true indicates the presence of a body.
 */
const FLAGS_POW2 = 5;

/**
 * The FieldOFViewMap represents the map over which the field of view will be
 * computed.  It starts out empty.  You can add walls and bodies to it, and then
 * use getFieldOfView() to compute the field of view from a given point.
 */
export class FieldOfViewMap {
    private readonly _size = new geom.Size();
    private readonly _tileFlags: number[];

    constructor(width: number, height: number) {
        this._size.set(width, height);
        this._tileFlags = new Array<number>((this._size.area >> FLAGS_POW2) + 1).fill(0);
    }

    // setup and maintenance

    addBody(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        const index = this._size.index(LOCAL_OFF);
        this._tileFlags[index >> FLAGS_POW2] |= 1 << (index & ((1 << FLAGS_POW2) - 1));
    }

    removeBody(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        const index = this._size.index(LOCAL_OFF);
        this._tileFlags[index >> FLAGS_POW2] &= ~(1 << (index & ((1 << FLAGS_POW2) - 1)));
    }

    getBody(x: number, y: number) {
        LOCAL_OFF.set(x, y);
        const index = this._size.index(LOCAL_OFF);
        return (this._tileFlags[index >> FLAGS_POW2] & (1 << (index & ((1 << FLAGS_POW2) - 1)))) !== 0;
    }

    // execution

    /**
     * Compute the field of view for a camera at the given tile.
     * chebyshevRadius is the vision radius.  It uses chebyshev distance
     * (https://en.wikipedia.org/wiki/Chebyshev_distance), which just means
     * that the limit of vision in a large empty field will be square.
     *
     * This returns a MaskRect, which indicates which tiles are visible.
     * maskRect.get(x, y) will return true for visible tiles.
     */
    getFieldOfView(x: number, y: number, chebyshevRadius: number): geom.MaskRect {
        const origin = new geom.Offset(x, y);
        const boundRect = new geom.Rectangle(
            origin.x - chebyshevRadius, origin.y - chebyshevRadius,
            chebyshevRadius * 2 + 1, chebyshevRadius * 2 + 1,
        );
        const mask = new geom.MaskRect(boundRect);
        // the player can always see itself
        mask.set(origin, true);
        // the field is divided into quadrants
        this._quadrant(mask, origin, chebyshevRadius, -1, -1);
        this._quadrant(mask, origin, chebyshevRadius,  1, -1);
        this._quadrant(mask, origin, chebyshevRadius, -1,  1);
        this._quadrant(mask, origin, chebyshevRadius,  1,  1);
        return mask;
    }

    private _quadrant(mask: geom.MaskRect, origin: geom.OffsetLike, chebyshevRadius: number,
                      xDir: number, yDir: number) {
        const {x: startX, y: startY} = origin;
        const endDX = (Math.min(Math.max(startX + xDir * (chebyshevRadius + 1),
                                         -1), this._size.width) - startX) * xDir;
        const endDY = (Math.min(Math.max(startY + yDir * (chebyshevRadius + 1),
                                         -1), this._size.height) - startY) * yDir;
        if (endDX < 0 || endDY < 0) {
            // the origin is outside of the map
            return;
        }
        const startMapIndex = this._size.index(origin);
        const startMaskIndex = mask.index(origin);
        // Initial wedge is from slope zero to slope infinity (i.e. the whole quadrant)
        const wedges = [0, Number.POSITIVE_INFINITY];
        // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
        // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
        for (let dy = 0, yMapIndex = startMapIndex, yMaskIndex = startMaskIndex;
             dy !== endDY && wedges.length > 0;
             dy ++, yMapIndex = yMapIndex + yDir * this._size.width, yMaskIndex = yMaskIndex + yDir * mask.width
        ) {
            const divYpos = 1 / (dy + 0.5);
            const divYneg = dy === 0 ? Number.POSITIVE_INFINITY : 1 / (dy - 0.5);
            let wedgeIndex = 0;
            // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
            // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
            for (let dx = 0, mapIndex = yMapIndex, maskIndex = yMaskIndex,
                 slopeY = -0.5 * divYpos, slopeX = 0.5 * divYneg;
                 dx !== endDX && wedgeIndex !== wedges.length;
                 dx ++, mapIndex = mapIndex + xDir, maskIndex = maskIndex + xDir,
                 slopeY = slopeY + divYpos, slopeX = slopeX + divYneg
            ) {
                // the slopes of the four corners of this tile
                // these are named as follows:
                //   slopeY is the slope closest to the Y axis
                //   slopeX is the slope closest to the X axis
                // this is always true:
                //   slopeY < slopeX
                //
                // O = origin, C = current
                // +---+---+---+
                // | O |   |   |
                // +---+---+---X
                // |   |   | C |
                // +---+---Y---+

                // advance the wedge index until this tile is not after the current wedge
                while (slopeY >= wedges[wedgeIndex + WEDGE_HIGH]) {
                    // X += Y must be written as X = X + Y, in order not to trigger deoptimization due to
                    // http://stackoverflow.com/questions/34595356/what-does-compound-let-const-assignment-mean
                    wedgeIndex = wedgeIndex + WEDGE_COUNT;
                    if (wedgeIndex >= wedges.length) {
                        break;
                    }
                }
                if (wedgeIndex >= wedges.length) {
                    break;
                }

                // if the current wedge is after this tile, move on
                if (slopeX <= wedges[wedgeIndex + WEDGE_LOW]) {
                    continue;
                }

                // we can see this tile
                mask.setAt(maskIndex, true);

                // const/let must be at the top of a block, in order not to trigger deoptimization due to
                // https://github.com/nodejs/node/issues/9729
                {
                    const body = (dx !== 0 || dy !== 0)
                        && (this._tileFlags[mapIndex >> FLAGS_POW2]
                            & (1 << (mapIndex & ((1 << FLAGS_POW2) - 1)))) !== 0;
                    if (body) {
                        wedgeIndex = cutWedge(wedges, wedgeIndex,
                            slopeY + BODY_EPSILON, slopeX - BODY_EPSILON);
                    }
                }
            }
        }
    }
}

/**
 * This function cuts a range of angles out of the wedge array.
 */
function cutWedge(wedges: number[], wedgeIndex: number, low: number, high: number): number {
    for (; ; ) {
        if (wedgeIndex === wedges.length) {
            return wedgeIndex;
        }
        if (low <= wedges[wedgeIndex + WEDGE_HIGH]) {
            break;
        }
        wedgeIndex += WEDGE_COUNT;
    }
    if (low <= wedges[wedgeIndex + WEDGE_LOW]) {
        if (high >= wedges[wedgeIndex + WEDGE_HIGH]) {
            // wedge is entirely occluded, remove it
            wedges.splice(wedgeIndex, WEDGE_COUNT);
            // now looking at the next wedge (or past the end)
            return cutWedge(wedges, wedgeIndex, low, high);
        } else if (high >= wedges[wedgeIndex + WEDGE_LOW]) {
            // low part of wedge is occluded, trim it
            wedges[wedgeIndex + WEDGE_LOW] = high;
            // still looking at the same wedge
        } else {
            // this cut doesn't reach the current wedge
        }
    } else if (high >= wedges[wedgeIndex + WEDGE_HIGH]) {
        // high part of wedge is occluded, trim it
        wedges[wedgeIndex + WEDGE_HIGH] = low;
        // move on to the next wedge
        wedgeIndex += WEDGE_COUNT;
        return cutWedge(wedges, wedgeIndex, low, high);
    } else {
        // middle part of wedge is occluded, split it
        wedges.splice(wedgeIndex, 0, wedges[wedgeIndex + WEDGE_LOW], low);
        wedgeIndex += WEDGE_COUNT;
        wedges[wedgeIndex + WEDGE_LOW] = high;
        // now looking at the second wedge of the split
    }
    return wedgeIndex;
}
