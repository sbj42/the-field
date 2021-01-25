import * as TheField from '../src';

function checkFov(fov: TheField.FieldOfView, str: string) {
    expect('\n' + fov.toString()).toBe(str);
}

describe('field-of-view', () => {
    it('works in middle of empty field', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        const fov = TheField.computeFieldOfView(map, 3, 3, 2);
        checkFov(fov, `
-----
-----
--@--
-----
-----
`);
    });
    it('works near north edge of empty field', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        const fov = TheField.computeFieldOfView(map, 3, 1, 2);
        checkFov(fov, `
.....
-----
--@--
-----
-----
`);
    });
    it('works near west edge of empty field', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        const fov = TheField.computeFieldOfView(map, 1, 3, 2);
        checkFov(fov, `
.----
.----
.-@--
.----
.----
`);
    });
    it('works near corner of empty field', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        const fov = TheField.computeFieldOfView(map, 5, 5, 2);
        checkFov(fov, `
----.
----.
--@-.
----.
.....
`);
    });
    it('works in middle of a field that\'s too small', () => {
        const map = new TheField.FieldOfViewMap(3, 3);
        const fov = TheField.computeFieldOfView(map, 1, 1, 2);
        checkFov(fov, `
.....
.---.
.-@-.
.---.
.....
`);
    });
    it('works for a simple square blocked-in room', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        map.addBody(2, 2);
        map.addBody(3, 2);
        map.addBody(4, 2);
        map.addBody(2, 3);
        map.addBody(4, 3);
        map.addBody(2, 4);
        map.addBody(3, 4);
        map.addBody(4, 4);
        const fov = TheField.computeFieldOfView(map, 3, 3, 2);
        checkFov(fov, `
.....
.---.
.-@-.
.---.
.....
`);
    });
    it('works for gaps between bodies', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        map.addBody(3, 2);
        map.addBody(2, 3);
        map.addBody(4, 3);
        map.addBody(3, 4);
        const fov = TheField.computeFieldOfView(map, 3, 3, 3);
        checkFov(fov, `
--...--
---.---
.-----.
..-@-..
.-----.
---.---
--...--
`);
    });
    it('gets example 1 right', () => {
        const map = new TheField.FieldOfViewMap(11, 11);
        map.addBody(3, 3);
        map.addBody(5, 3);
        map.addBody(6, 5);
        map.addBody(3, 6);
        map.addBody(4, 8);
        const fov = TheField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
..---.-----
..---.-----
--.--.----.
---------..
--------...
-----@-....
--------...
..-------..
.---------.
-----------
---.-------
`);
    });
    it('gets example 2 right', () => {
        const map = new TheField.FieldOfViewMap(11, 11);
        map.addBody(4, 3);
        map.addBody(3, 4);
        map.addBody(8, 5);
        map.addBody(7, 6);
        map.addBody(2, 7);
        map.addBody(3, 7);
        map.addBody(4, 7);
        map.addBody(6, 7);
        map.addBody(7, 7);
        const fov = TheField.computeFieldOfView(map, 5, 5, 5);
        checkFov(fov, `
--..-------
---.-------
.----------
..---------
-----------
-----@---..
-----------
--------...
....---....
....---....
....---....
`);
    });
    it('works with offset out of bounds', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        const fov = TheField.computeFieldOfView(map, 10, 10, 2);
        checkFov(fov, `
---..
---..
--@..
.....
.....
`);
    });
    it('works with negative offsets', () => {
        const map = new TheField.FieldOfViewMap(7, 7);
        const fov = TheField.computeFieldOfView(map, -2, -2, 2);
        checkFov(fov, `
.....
.....
..@--
..---
..---
`);
    });
});
