/**
 * Find edges in an image using the Canny algorithm.
 * https://en.wikipedia.org/wiki/Canny_edge_detector
 * @template Image
 * @param {Image} image - A greyscale Image.
 * @param {Options=} options - Optional configuration settings.
 * @returns {Image} A greyscale image with the edges at options.brightness value.
 */
export default function cannyEdgeDetector<Image>(image: Image, options?: Options | undefined): Image;
/**
 * Optional edge detection options.
 */
export type Options = {
  /**
   * Low threshold for the hysteresis procedure (default: 10).
   */
  lowThreshold?: number | undefined;
  /**
   * High threshold for the hysteresis procedure (default: 30).
   */
  highThreshold?: number | undefined;
  /**
   * Sigma parameter for the gaussian filter step (default: 1.1).
   */
  gaussianBlur?: number | undefined;
  /**
   * Values assigned to each edge pixel on the result image (default: image.maxValue).
   */
  brightness?: number | undefined;
};
