import { MutableFreePointer } from "../../Drawing/FreePointer.js";
/**
 */

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").RectangleGenerator} RectGen
 */

/**
 * @implements {RectGen}
 */
export class SimpleBoxGen {
  /**
   *
   * @param {MutableFreePointer} begin
   * @param {Rectangle} regular
   */
  constructor(begin, regular) {
    this.beginLeftTop = regular.getPoint("left", "top").setHeight(begin);
    this.regular = regular;
  }

  /**
   * @param {number} index
   * @returns {Rectangle}
   */
  get(index) {
    if (index === 0) {
      return this.beginLeftTop.span(this.regular.getPoint("right", "bottom"));
    }
    return this.regular;
  }
}
