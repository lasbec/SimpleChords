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
   * @param {MutableFreePointer=} begin
   * @param {Rectangle} regular
   */
  constructor(regular, begin) {
    this.beginLeftTop = begin
      ? regular.getPoint("left", "top").setHeight(begin)
      : regular.getPoint("left", "top");
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
