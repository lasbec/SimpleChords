import { Lenght } from "./Lenght";

export class Page {
  /** @type {Lenght} */
  height;
  /** @type {Lenght} */
  width;

  /**
   * @param {Dimesions} dims
   */
  constructor(dims) {
    this.height = dims.height;
    this.width = dims.width;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {}
}

export class ChildBox {
  /** @type {Lenght} */
  height;
  /** @type {Lenght} */
  width;

  /** @type {Point} */
  bottomLeft;

  /**
   * @param {Dimesions} dims
   * @param {Point} bottomLeft
   */
  constructor(dims, bottomLeft) {
    this.height = dims.height;
    this.width = dims.width;
    this.bottomLeft = bottomLeft;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   c
   */
  getPointerAt(x, y) {}
}

class BoxPointer {
  /** @type {Lenght}*/
  x;
  /** @type {Lenght}*/
  y;
  /** @type {Page}*/
  box;

  /**
   *
   * @param {Lenght} x
   * @param {Lenght} y
   * @param {Page} box
   */
  constructor(x, y, box) {
    this.x = x;
    this.y = y;
    this.box = box;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {string} text
   */
  drawTo(x, y, text) {}
}

/** @typedef {"center" | "left" | "right"} XStartPosition */
/** @typedef {"center" | "bottom" | "top"} YStartPosition */

/**
 * @typedef {object} Dimesions
 * @param {Lenght} width
 * @param {Lenght} height
 */

/**
 * @typedef {object} Point
 * @param {Lenght} x
 * @param {Lenght} y
 */
