# TheField

[![Dependencies](https://david-dm.org/sbj42/the-field.svg)](https://david-dm.org/sbj42/the-field)
[![Node.js CI](https://github.com/sbj42/the-field/workflows/Node.js%20CI/badge.svg)](https://github.com/sbj42/the-field/actions?query=workflow%3A%22Node.js+CI%22)
[![License](https://img.shields.io/github/license/sbj42/the-field.svg)](https://github.com/sbj42/the-field)

#### Basic shadow-casting field-of-view algorithm

[See the demo](https://sbj42.github.io/projects/the-field-demo/www/), and check out other variations of this algorithm: [WallyFOV](https://github.com/sbj42/wally-fov) add support for walls, and [WarpField](https://github.com/sbj42/warp-field) supports portals.

## Installation

~~~
npm install the-field
~~~

## Usage

Create a map:
```js
const TheField = require('the-field');

const width = 5;
const height = 5;
const fovMap = new TheField.FieldOfViewMap(width, height);
```

Add some bodies (a.k.a. obstacles):
```js
fovMap.addBody(2, 3);
fovMap.addBody(0, 4);
// keep the map up-to-date if a body is removed:
fovMap.removeBody(0, 4);
```

Compute the field of view:
```js
const playerX = 2;
const playerY = 2;
const visionRadius = 2;
const fov = fovMap.getFieldOfView(playerX, playerY, visionRadius);
```

See which tiles are visible:
```js
fov.get(4, 0); // -> true
fov.get(4, 1); // -> false
```

## Details

TheField works by scanning the four quadrants around the player, tracking the angles visible from the center of the player tile.  A tile is considered visible if there exists an uninterrupted ray from the player center to any point in the tile.  Bodies almost (but don't quite) fill the tile, to cover some conspicuous "corner" cases.

![Example Image](https://raw.githubusercontent.com/sbj42/the-field/master/img/example2.png)

In this example image, the shaded tiles are not seen.  Blue lines represent edges of the shadows at various stages of the algorithm.  Dashed lines indicate where a shadow edge is very slightly shifted because it grazes a body.
