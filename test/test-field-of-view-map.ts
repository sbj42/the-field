import {FieldOfViewMap} from '../src';

describe('field-of-view-map', () => {
    it('body manipulation works', () => {
        const map = new FieldOfViewMap(7, 7);
        expect(map.getBody(0, 0)).toBe(false);
        expect(map.getBody(1, 0)).toBe(false);
        expect(map.getBody(0, 1)).toBe(false);
        expect(map.getBody(1, 1)).toBe(false);
        map.addBody(0, 0);
        map.addBody(0, 1);
        expect(map.getBody(0, 0)).toBe(true);
        expect(map.getBody(1, 0)).toBe(false);
        expect(map.getBody(0, 1)).toBe(true);
        expect(map.getBody(1, 1)).toBe(false);
        expect(map.getBody(5, 5)).toBe(false);
        expect(map.getBody(6, 6)).toBe(false);
        map.addBody(1, 0);
        map.addBody(1, 1);
        map.removeBody(0, 0);
        map.removeBody(0, 1);
        map.addBody(5, 5);
        map.addBody(6, 6);
        expect(map.getBody(0, 0)).toBe(false);
        expect(map.getBody(1, 0)).toBe(true);
        expect(map.getBody(0, 1)).toBe(false);
        expect(map.getBody(1, 1)).toBe(true);
        expect(map.getBody(5, 5)).toBe(true);
        expect(map.getBody(6, 6)).toBe(true);
        map.removeBody(5, 5);
        map.removeBody(6, 6);
        expect(map.getBody(5, 5)).toBe(false);
        expect(map.getBody(6, 6)).toBe(false);
    });
});
