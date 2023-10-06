import { LEN, Length } from "../Length.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("./TextConfig.js").TextConfig} TextConfig
 */

/**
 * @typedef {object} OverflowCalcArgs
 * @property {Box} parent
 * @property {Box} child
 */

/**
 * @typedef {object} BoxOverflowsConstructorArgs
 * @property {Length} left
 * @property {Length} right
 * @property {Length} bottom
 * @property {Length} top
 */
export class BoxOverflows {
  /** @type {Length}*/
  left;
  /** @type {Length}*/
  right;
  /** @type {Length}*/
  bottom;
  /** @type {Length}*/
  top;

  /**
   * @param {BoxOverflowsConstructorArgs} args
   */
  constructor(args) {
    this.left = args.left;
    this.right = args.right;
    this.bottom = args.bottom;
    this.top = args.top;
  }

  isEmpty() {
    const tolerance = LEN(1, "pt");
    return (
      this.top.lt(tolerance) &&
      this.bottom.lt(tolerance) &&
      this.left.lt(tolerance) &&
      this.right.lt(tolerance)
    );
  }

  /** @param {OverflowCalcArgs} args */
  static from(args) {
    const box = args.child;
    const leftBottomCorner = box.getPoint("left", "bottom");
    const rightBorder = leftBottomCorner.x.add(box.width);
    const leftBorder = leftBottomCorner.x;
    const topBorder = leftBottomCorner.y.add(box.height);
    const bottomBorder = leftBottomCorner.y;

    const parent = args.parent;
    const parentLeftBottomCorner = parent.getPoint("left", "bottom");
    const parentRightBorder = parentLeftBottomCorner.x.add(parent.width);
    const parentLeftBorder = parentLeftBottomCorner.x;
    const parentTopBorder = parentLeftBottomCorner.y.add(parent.height);
    const parentBottomBorder = parentLeftBottomCorner.y;

    return new BoxOverflows({
      right: rightBorder.sub(parentRightBorder).atLeastZero(),
      left: parentLeftBorder.sub(leftBorder).atLeastZero(),
      top: topBorder.sub(parentTopBorder).atLeastZero(),
      bottom: parentBottomBorder.sub(bottomBorder).atLeastZero(),
    });
  }

  toString() {
    let result = [];
    if (this.bottom.gtz()) {
      result.push(`bottom ${this.bottom.toString("mm")}`);
    }
    if (this.top.gtz()) {
      result.push(`top ${this.top.toString("mm")}`);
    }
    if (this.left.gtz()) {
      result.push(`left ${this.left.toString("mm")}`);
    }
    if (this.right.gtz()) {
      result.push(`right ${this.right.toString("mm")}`);
    }
    return `BoxOverflow at: ` + result.join(", ") + ".";
  }
  /** @param {BoxTreeNode} box */
  static assertBoxIsInsideParent(box) {
    const overflows = BoxOverflows.from({ child: box, parent: box.parent });
    if (!overflows.isEmpty()) {
      throw new Error(overflows.toString());
    }
  }
}
