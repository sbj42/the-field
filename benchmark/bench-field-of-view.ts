import * as Benchmark from 'benchmark';
import * as seedrandom from 'seedrandom';

import {FieldOfViewMap} from '../src';

/* eslint-disable no-console */

const suite = new Benchmark.Suite();
suite.on('cycle', (event: {target: string}) => {
    console.log(`field-of-view/${event.target}`);
});
const width = 31;
const height = 31;
const originX = 15;
const originY = 15;
{
    const fovMap = new FieldOfViewMap(width, height);
    suite.add('FieldOfViewMap#getFieldOfView([15x15 empty field])', () => {
        fovMap.getFieldOfView(originX, originY, 15);
    });
}
{
    const fovMap = new FieldOfViewMap(width, height);
    const random = seedrandom.alea('abc');
    const chance = 0.07;
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (random() < chance) {
                fovMap.addBody(x, y);
            }
        }
    }
    suite.add('FieldOfViewMap#getFieldOfView([15x15 with some bodies])', () => {
        fovMap.getFieldOfView(originX, originY, 15);
    });
}

suite.run();
