import * as TheField from '../../lib';
import * as EasyStar from 'easystarjs';

const demo = document.getElementById('canvas') as HTMLCanvasElement;
const context = demo.getContext('2d') as CanvasRenderingContext2D;
const width = 37;
const height = 19;
const tileImages = new Array<string[]>(width * height);

function index(x: number, y: number) {
    return y * width + x;
}

let map: TheField.FieldOfViewMap;
let easystar: EasyStar.js;

enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST,
}

function generateMap() {

    map = new TheField.FieldOfViewMap(width, height);
    easystar = new EasyStar.js();
    const grid = new Array<number[]>();
    for (let y = 0; y < height; y ++) {
        grid.push(new Array<number>(width).fill(0));
    }
    easystar.enableDiagonals();
    easystar.setGrid(grid);
    easystar.setAcceptableTiles([0]);
    easystar.enableSync();

    const turnChance = 0.01;
    for (let i = 0; i < 20; i ++) {
        let x = Math.floor(Math.random() * (width - 2) + 1);
        let y = Math.floor(Math.random() * (height - 2) + 1);
        if (map.getBody(x, y)) {
            continue;
        }
        let dir = Math.floor(Math.random() * 4) as Direction;
        const len = Math.floor(Math.random() * 10 + 2);
        for (let j = 0; j < len; j ++) {
            if (x < 1 || x >= width-1 || y < 1 || y >= height-1) {
                break;
            }
            map.addBody(x, y);
            grid[y][x] = 1;
            const turn = Math.random();
            switch (dir) {
                case Direction.NORTH:
                    if (turn < turnChance) {
                        dir = Direction.WEST;
                        x ++;
                        y --;
                    } else if (turn > 1 - turnChance) {
                        dir = Direction.EAST;
                    } else {
                        x ++;
                    }
                    break;
                case Direction.EAST:
                    if (turn < turnChance) {
                        dir = Direction.NORTH;
                        x ++;
                        y ++;
                    } else if (turn > 1 - turnChance) {
                        dir = Direction.SOUTH;
                    } else {
                        y ++;
                    }
                    break;
                case Direction.SOUTH:
                    if (turn < turnChance) {
                        dir = Direction.EAST;
                        x --;
                        y ++;
                    } else if (turn > 1 - turnChance) {
                        dir = Direction.WEST;
                    } else {
                        x --;
                    }
                    break;
                case Direction.WEST:
                    if (turn < turnChance) {
                        dir = Direction.SOUTH;
                        x --;
                        y --;
                    } else if (turn > 1 - turnChance) {
                        dir = Direction.NORTH;
                    } else {
                        y --;
                    }
                    break;
            }
        }
    }

    const bodyChance = 0.03;
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (Math.random() < bodyChance) {
                map.addBody(x, y);
                grid[y][x] = 1;
            }
        }
    }

}

function randomPlace() {
    let x: number;
    let y: number;
    do {
        x = Math.floor(Math.random() * width);
        y = Math.floor(Math.random() * height);
    } while (map.getBody(x, y));
    return [x, y];
}

let px: number;
let py: number;

function start() {
    generateMap();
    [px, py] = randomPlace();
    tileImages.fill([]);
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            const images = tileImages[index(x, y)] = [] as string[];
            if (Math.random() > 0.3) {
                images.push('floor' + Math.floor(1 + Math.random() * 6));
            }
            if (map.getBody(x, y)) {
                images.push('box' + Math.floor(1 + Math.random() * 3));
            }
            images.forEach((image) => {
                context.drawImage(tiles, imageOff[image] * 32, 0, 32, 32, x * 32, y * 32, 32, 32);
            });
        }
    }
}

function render() {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, width * 32, height * 32);
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            const images = tileImages[index(x, y)];
            images.forEach((image) => {
                context.drawImage(tiles, imageOff[image] * 32, 0, 32, 32, x * 32, y * 32, 32, 32);
            });
            if (x === px && y === py) {
                context.drawImage(tiles, imageOff['player'] * 32, 0, 32, 32, x * 32, y * 32, 32, 32);
            }
        }
    }
    const fov = map.getFieldOfView(px, py, 15);
    for (let y = 0; y < height; y ++) {
        for (let x = 0; x < width; x ++) {
            if (!fov.get(x, y)) {
                context.drawImage(tiles, imageOff['shadow'] * 32, 0, 32, 32, x * 32, y * 32, 32, 32);
            }
        }
    }
}

const imageOff: {[id: string]: number} = {
    'floor1': 0,
    'floor2': 1,
    'floor3': 2,
    'floor4': 3,
    'floor5': 4,
    'floor6': 5,
    'player': 6,
    'box1': 7,
    'box2': 8,
    'box3': 9,
    'shadow': 10,
};
const tiles = new Image();
tiles.src = './tiles.png';
tiles.onload = function() {

    start();

    let working = false;
    let path: {x: number, y: number}[] | undefined;

    function step() {

        if (!path) {
            if (working) {
                easystar.calculate();
            } else {
                const [nx, ny] = randomPlace();
                working = true;
                easystar.findPath(px, py, nx, ny, function(p) {
                    path = p;
                    working = false;
                    requestAnimationFrame(step);
                });
                easystar.calculate();
                return;
            }
        } else if (path.length > 0) {
            const part = path.shift();
            if (part) {
                const {x: nx, y: ny} = part;
                px = nx;
                py = ny;
            }
        } else {
            path = undefined;
        }

        render();
        setTimeout(() => requestAnimationFrame(step), 120);
    }

    requestAnimationFrame(step);

};