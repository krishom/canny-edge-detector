/**
 * @typedef {object} Options Optional edge detection options.
 * @property {number=} lowThreshold Low threshold for the hysteresis procedure (default: 10).
 * @property {number=} highThreshold High threshold for the hysteresis procedure (default: 30).
 * @property {number=} gaussianBlur Sigma parameter for the gaussian filter step (default: 1.1).
 * @property {number=} brightness Values assigned to each edge pixel on the result image (default: image.maxValue).
 */

/**
 * Default Canny edge detection options.
 * @type {Options}
 */
const defaultOptions = {
  lowThreshold: 10,
  highThreshold: 30,
  gaussianBlur: 1.1
};

const Gx = [
  [-1, 0, +1],
  [-2, 0, +2],
  [-1, 0, +1]
];

const Gy = [
  [-1, -2, -1],
  [0, 0, 0],
  [+1, +2, +1]
];

const convOptions = {
  bitDepth: 32,
  mode: 'periodic'
};

/**
 * Find edges in an image using the Canny algorithm.
 * https://en.wikipedia.org/wiki/Canny_edge_detector
 * @template Image
 * @param {Image} image - A greyscale Image.
 * @param {Options=} options - Optional configuration settings.
 * @returns {Image} A greyscale image with the edges at options.brightness value.
 */
export default function cannyEdgeDetector(image, options) {
  image.checkProcessable('Canny edge detector', {
    bitDepth: 8,
    channels: 1,
    components: 1
  });

  options = { ...defaultOptions, ...options };

  const width = image.width;
  const height = image.height;
  const brightness = image.maxValue;

  const gfOptions = {
    sigma: options.gaussianBlur,
    radius: 3
  };

  const gf = image.gaussianFilter(gfOptions);

  const gradientX = gf.convolution(Gy, convOptions);
  const gradientY = gf.convolution(Gx, convOptions);

  const G = gradientY.hypotenuse(gradientX);

  const Image = image.constructor;

  const nms = new Image(width, height, {
    kind: 'GREY',
    bitDepth: 32
  });

  const edges = new Image(width, height, {
    kind: 'GREY',
    bitDepth: 32
  });

  const finalImage = new Image(width, height, {
    kind: 'GREY'
  });

  // Non-Maximum supression
  for (let i = 1; i < width - 1; i++) {
    for (let j = 1; j < height - 1; j++) {
      const dir =
        (Math.round(Math.atan2(gradientY.getValueXY(i, j, 0), gradientX.getValueXY(i, j, 0)) * (5 / Math.PI)) + 5) % 5;

      if (
        !(
          (dir === 0 &&
            (G.getValueXY(i, j, 0) <= G.getValueXY(i, j - 1, 0) ||
              G.getValueXY(i, j, 0) <= G.getValueXY(i, j + 1, 0))) ||
          (dir === 1 &&
            (G.getValueXY(i, j, 0) <= G.getValueXY(i - 1, j + 1, 0) ||
              G.getValueXY(i, j, 0) <= G.getValueXY(i + 1, j - 1, 0))) ||
          (dir === 2 &&
            (G.getValueXY(i, j, 0) <= G.getValueXY(i - 1, j, 0) ||
              G.getValueXY(i, j, 0) <= G.getValueXY(i + 1, j, 0))) ||
          (dir === 3 &&
            (G.getValueXY(i, j, 0) <= G.getValueXY(i - 1, j - 1, 0) ||
              G.getValueXY(i, j, 0) <= G.getValueXY(i + 1, j + 1, 0)))
        )
      ) {
        nms.setValueXY(i, j, 0, G.getValueXY(i, j, 0));
      }
    }
  }

  for (let i = 0; i < width * height; ++i) {
    const currentNms = nms.data[i];
    let currentEdge = 0;
    if (currentNms > options.highThreshold) {
      currentEdge++;
      finalImage.data[i] = brightness;
    }
    if (currentNms > options.lowThreshold) {
      currentEdge++;
    }

    edges.data[i] = currentEdge;
  }

  // Hysteresis: first pass
  let currentPixels = [];
  for (let i = 1; i < width - 1; ++i) {
    for (let j = 1; j < height - 1; ++j) {
      if (edges.getValueXY(i, j, 0) !== 1) {
        continue;
      }

      outer: for (let k = i - 1; k < i + 2; ++k) {
        for (let l = j - 1; l < j + 2; ++l) {
          if (edges.getValueXY(k, l, 0) === 2) {
            currentPixels.push([i, j]);
            finalImage.setValueXY(i, j, 0, brightness);
            break outer;
          }
        }
      }
    }
  }

  // Hysteresis: second pass
  while (currentPixels.length > 0) {
    const newPixels = [];
    for (let i = 0; i < currentPixels.length; ++i) {
      for (let j = -1; j < 2; ++j) {
        for (let k = -1; k < 2; ++k) {
          if (j === 0 && k === 0) {
            continue;
          }
          const row = currentPixels[i][0] + j;
          const col = currentPixels[i][1] + k;
          if (edges.getValueXY(row, col, 0) === 1 && finalImage.getValueXY(row, col, 0) === 0) {
            newPixels.push([row, col]);
            finalImage.setValueXY(row, col, 0, brightness);
          }
        }
      }
    }
    currentPixels = newPixels;
  }

  return finalImage;
}
