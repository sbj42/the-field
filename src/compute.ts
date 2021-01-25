import * as geom from 'tiled-geometry';
import { FieldOfViewMap } from './field-of-view-map';
import * as constants from './constants';
import { FieldOfView } from './field-of-view';
import { FieldOfViewImpl } from './field-of-view-impl';
import { cutWedges, initWedges, Wedge } from './wedge';

/* eslint-disable indent */

/**
 * Compute the field of view for a camera at the given tile.
 * chebyshevRadius is the vision radius.  It uses chebyshev distance
 * (https://en.wikipedia.org/wiki/Chebyshev_distance), which just means
 * that the limit of vision in a large empty field will be square.
 *
 * This returns a FieldOfView, which indicates which tiles are visible.
 * fieldOfView.get(x, y) will return true for visible tiles.
 */
export function computeFieldOfView(map: FieldOfViewMap, x: number, y: number, chebyshevRadius: number): FieldOfView {
    const origin = new geom.Offset(x, y);
    const field = new FieldOfViewImpl(origin, chebyshevRadius);
    // the field is divided into quadrants
    quadrant(map, field, origin, chebyshevRadius, -1, -1);
    quadrant(map, field, origin, chebyshevRadius,  1, -1);
    quadrant(map, field, origin, chebyshevRadius, -1,  1);
    quadrant(map, field, origin, chebyshevRadius,  1,  1);
    return field;
}

function quadrant(map: FieldOfViewMap, field: FieldOfViewImpl, origin: geom.OffsetLike, chebyshevRadius: number,
                  xSign: -1 | 1, ySign: -1 | 1) {
    const {x: startX, y: startY} = origin;
    const endDX = (Math.min(Math.max(startX + xSign * (chebyshevRadius + 1),
                                     -1), map.width) - startX) * xSign;
    const endDY = (Math.min(Math.max(startY + ySign * (chebyshevRadius + 1),
                                     -1), map.height) - startY) * ySign;
    if (endDX < 0 || endDY < 0) {
        // the origin is outside of the map
        return;
    }
    const startMapIndex = map.index(origin.x, origin.y);
    const startMaskIndex = field.visible.index(origin.x, origin.y);
    // Initial wedge is from slope zero to slope infinity (i.e. the whole quadrant)
    let wedges: Wedge[] = initWedges();
    for (let dy = 0, yMapIndex = startMapIndex, yMaskIndex = startMaskIndex;
            dy !== endDY && wedges.length > 0;
            dy ++, yMapIndex += ySign * map.width, yMaskIndex += ySign * field.visible.width
    ) {
        const divYpos = 1 / (dy + 0.5);
        const divYneg = dy === 0 ? Number.POSITIVE_INFINITY : 1 / (dy - 0.5);
        let wedgeIndex = 0;
        for (let dx = 0, mapIndex = yMapIndex, maskIndex = yMaskIndex,
                slopeY = -0.5 * divYpos, slopeX = 0.5 * divYneg;
                dx !== endDX && wedgeIndex !== wedges.length;
                dx ++, mapIndex += xSign, maskIndex += xSign,
                slopeY += divYpos, slopeX += divYneg
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
            while (slopeY > wedges[wedgeIndex].high) {
                wedgeIndex ++;
                if (wedgeIndex >= wedges.length) {
                    break;
                }
            }
            if (wedgeIndex >= wedges.length) {
                break;
            }

            // if the current wedge is after this tile, move on
            if (slopeX < wedges[wedgeIndex].low) {
                continue;
            }

            // we can see this tile
            field.visible.setAtIndex(maskIndex, true);

            const body = (dx !== 0 || dy !== 0) && map.getBodyAtIndex(mapIndex);
            if (body) {
                wedges = cutWedges(wedges,
                    slopeY + constants.BODY_INSET, slopeX - constants.BODY_INSET);
            }
        }
    }
}
