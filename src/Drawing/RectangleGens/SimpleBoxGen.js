import { PointImpl } from "../Figures/PointImpl.js";
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
   * @param {PointImpl=} begin
   * @param {Rectangle} regular
   */
  constructor(regular, begin) {
    this.begin = begin;
    this.beginLeftTop = begin
      ? regular.getPoint("left", "top").alignVerticalWith(begin)
      : regular.getPoint("left", "top");
    this.regular = regular;
    /** @private */
    this.count = 0;
  }

  clone(){
    const result = new SimpleBoxGen(this.regular, this.begin)
    result.count = this.count;
    return result;
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

  get lenght() {
    return this.count;
  }

  next() {
    const result = this.get(this.count);
    this.count += 1;
    return result;
  }
}
