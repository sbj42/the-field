import * as assert from 'assert';

import {FieldOfViewMap} from '../src/field-of-view';

describe('carto/field-of-view', () => {
    it('works in middle of empty field', () => {
        const fovMap = new FieldOfViewMap(7, 7);
        const fov = fovMap.getFieldOfView(3, 3, 2);
        assert.equal(fov.toString(), `(1,1)/false
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
        assert.equal(fov.toString(), `(1,-1)/false
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
        assert.equal(fov.toString(), `(-1,1)/false
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
        assert.equal(fov.toString(), `(3,3)/false
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
        assert.equal(fov.toString(), `(-1,-1)/false
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
        assert.equal(fov.toString(), `(1,1)/false
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
        assert.equal(fov.toString(), `(0,0)/false
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
        assert.equal(fov.toString(), `(0,0)/false
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
        assert.equal(fov.toString(), `(0,0)/false
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
        assert.equal(fov.toString(), `(8,8)/false
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
        assert.equal(fov.toString(), `(-4,-4)/false
☐☐☐☐☐
☐☐☐☐☐
☐☐☑☑☑
☐☐☑☑☑
☐☐☑☑☑
`);
    });
});
