import * as assert from 'assert';

import {FieldOfViewMap} from '../src/field-of-view';

describe('field-of-view', () => {
    it('body manipulation works', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        assert.strictEqual(false, fovMap.getBody(0, 0));
        assert.strictEqual(false, fovMap.getBody(1, 0));
        assert.strictEqual(false, fovMap.getBody(0, 1));
        assert.strictEqual(false, fovMap.getBody(1, 1));
        fovMap.addBody(0, 0);
        fovMap.addBody(0, 1);
        assert.strictEqual(true, fovMap.getBody(0, 0));
        assert.strictEqual(false, fovMap.getBody(1, 0));
        assert.strictEqual(true, fovMap.getBody(0, 1));
        assert.strictEqual(false, fovMap.getBody(1, 1));
        assert.strictEqual(false, fovMap.getBody(5, 5));
        assert.strictEqual(false, fovMap.getBody(6, 6));
        fovMap.addBody(1, 0);
        fovMap.addBody(1, 1);
        fovMap.removeBody(0, 0);
        fovMap.removeBody(0, 1);
        fovMap.addBody(5, 5);
        fovMap.addBody(6, 6);
        assert.strictEqual(false, fovMap.getBody(0, 0));
        assert.strictEqual(true, fovMap.getBody(1, 0));
        assert.strictEqual(false, fovMap.getBody(0, 1));
        assert.strictEqual(true, fovMap.getBody(1, 1));
        assert.strictEqual(true, fovMap.getBody(5, 5));
        assert.strictEqual(true, fovMap.getBody(6, 6));
        fovMap.removeBody(5, 5);
        fovMap.removeBody(6, 6);
        assert.strictEqual(false, fovMap.getBody(5, 5));
        assert.strictEqual(false, fovMap.getBody(6, 6));
    });
    it('works in middle of empty field', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.strictEqual(fov.toString(), `(1,1)/false
☑☑☑☑☑
☑☑☑☑☑
☑☑☑☑☑
☑☑☑☑☑
☑☑☑☑☑
`);
    });
    it('works near north edge of empty field', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(3, 1, 2);
        assert.strictEqual(fov.toString(), `(1,-1)/false
☐☐☐☐☐
☑☑☑☑☑
☑☑☑☑☑
☑☑☑☑☑
☑☑☑☑☑
`);
    });
    it('works near west edge of empty field', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(1, 3, 2);
        assert.strictEqual(fov.toString(), `(-1,1)/false
☐☑☑☑☑
☐☑☑☑☑
☐☑☑☑☑
☐☑☑☑☑
☐☑☑☑☑
`);
    });
    it('works near corner of empty field', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(5, 5, 2);
        assert.strictEqual(fov.toString(), `(3,3)/false
☑☑☑☑☐
☑☑☑☑☐
☑☑☑☑☐
☑☑☑☑☐
☐☐☐☐☐
`);
    });
    it('works in middle of a field that\'s too small', () => {
        const fovMap = new FieldOfViewMap(3, 3);
        const fov = fovMap.getFieldOfView(1, 1, 2);
        assert.strictEqual(fov.toString(), `(-1,-1)/false
☐☐☐☐☐
☐☑☑☑☐
☐☑☑☑☐
☐☑☑☑☐
☐☐☐☐☐
`);
    });
    it('works for a simple square blocked-in room', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        fovMap.addBody(2, 2);
        fovMap.addBody(3, 2);
        fovMap.addBody(4, 2);
        fovMap.addBody(2, 3);
        fovMap.addBody(4, 3);
        fovMap.addBody(2, 4);
        fovMap.addBody(3, 4);
        fovMap.addBody(4, 4);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.strictEqual(fov.toString(), `(1,1)/false
☐☐☐☐☐
☐☑☑☑☐
☐☑☑☑☐
☐☑☑☑☐
☐☐☐☐☐
`);
    });
    it('works for gaps between bodies', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        fovMap.addBody(3, 2);
        fovMap.addBody(2, 3);
        fovMap.addBody(4, 3);
        fovMap.addBody(3, 4);
        const fov = fovMap.getFieldOfView(3, 3, 3);
        assert.strictEqual(fov.toString(), `(0,0)/false
☑☑☐☐☐☑☑
☑☑☑☐☑☑☑
☐☑☑☑☑☑☐
☐☐☑☑☑☐☐
☐☑☑☑☑☑☐
☑☑☑☐☑☑☑
☑☑☐☐☐☑☑
`);
    });
    it('gets example 1 right', () => {
        const fovMap = new FieldOfViewMap(11, 11);
        fovMap.addBody(3, 3);
        fovMap.addBody(5, 3);
        fovMap.addBody(6, 5);
        fovMap.addBody(3, 6);
        fovMap.addBody(4, 8);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.strictEqual(fov.toString(), `(0,0)/false
☐☐☑☑☑☐☑☑☑☑☑
☐☐☑☑☑☐☑☑☑☑☑
☑☑☐☑☑☐☑☑☑☑☐
☑☑☑☑☑☑☑☑☑☐☐
☑☑☑☑☑☑☑☑☐☐☐
☑☑☑☑☑☑☑☐☐☐☐
☑☑☑☑☑☑☑☑☐☐☐
☐☐☑☑☑☑☑☑☑☐☐
☐☑☑☑☑☑☑☑☑☑☐
☑☑☑☑☑☑☑☑☑☑☑
☑☑☑☐☑☑☑☑☑☑☑
`);
    });
    it('gets example 2 right', () => {
        const fovMap = new FieldOfViewMap(11, 11);
        fovMap.addBody(4, 3);
        fovMap.addBody(3, 4);
        fovMap.addBody(8, 5);
        fovMap.addBody(7, 6);
        fovMap.addBody(2, 7);
        fovMap.addBody(3, 7);
        fovMap.addBody(4, 7);
        fovMap.addBody(6, 7);
        fovMap.addBody(7, 7);
        const fov = fovMap.getFieldOfView(5, 5, 5);
        assert.strictEqual(fov.toString(), `(0,0)/false
☑☑☐☐☑☑☑☑☑☑☑
☑☑☑☐☑☑☑☑☑☑☑
☐☑☑☑☑☑☑☑☑☑☑
☐☐☑☑☑☑☑☑☑☑☑
☑☑☑☑☑☑☑☑☑☑☑
☑☑☑☑☑☑☑☑☑☐☐
☑☑☑☑☑☑☑☑☑☑☑
☑☑☑☑☑☑☑☑☐☐☐
☐☐☐☐☑☑☑☐☐☐☐
☐☐☐☐☑☑☑☐☐☐☐
☐☐☐☐☑☑☑☐☐☐☐
`);
    });
    it('works with offset out of bounds', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(10, 10, 2);
        assert.strictEqual(fov.toString(), `(8,8)/false
☑☑☑☐☐
☑☑☑☐☐
☑☑☑☐☐
☐☐☐☐☐
☐☐☐☐☐
`);
    });
    it('works with negative offsets', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(-2, -2, 2);
        assert.strictEqual(fov.toString(), `(-4,-4)/false
☐☐☐☐☐
☐☐☐☐☐
☐☐☑☑☑
☐☐☑☑☑
☐☐☑☑☑
`);
    });
});
