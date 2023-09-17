/**
 * @typedef {import("../Length.js").Length} Length
 */

export class FreePointer {
  /**
   * @type {Length}
   */
  x;
  /**
   * @type {Length}
   */
  y;

  /**
   *
   * @param {Length} x
   * @param {Length} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /** @param {Length} offset  */
  moveRight(offset) {
    this.x = this.x.add(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveLeft(offset) {
    this.x = this.x.sub(offset);
    return this;
  }

  /** @param {Length} offset  */
  moveUp(offset) {
    this.y = this.y.add(offset);
    return this;
  }

  clone() {
    return new FreePointer(this.x, this.y);
  }

  /** @param {Length} offset  */
  moveDown(offset) {
    this.y = this.y.sub(offset);
    return this;
  }
}
