import * as fs from 'node:fs';

import { Image } from 'image-js';

import cannyEdgeDetector from '../src/index.js';

function writeImage(path, image) {
  fs.writeFile(path, image.toBuffer({ format: 'png' }), (err) => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log(`Image saved successfully to ${path}`);
    }
  });
}

async function main() {
  const promises = [
    Image.load('./test/img/test1.png'),
    Image.load('./test/img/test2.png'),
    Image.load('./test/img/testres.png')
  ];
  const images = await Promise.all(promises);
  const params = {
    lowThreshold: 10,
    highThreshold: 30,
    gaussianBlur: 1.1
  };
  const edges1 = cannyEdgeDetector(images[0].grey(), params);
  const edges2 = cannyEdgeDetector(images[1].grey(), params);
  writeImage('./test/img/edges1.png', edges1);
  writeImage('./test/img/edges2.png', edges2);
}

await main();
