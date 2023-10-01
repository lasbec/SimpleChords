import { LEN, Length } from "../Length.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 * @typedef {import("./Geometry.js").HOBox} HOBox
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("./TextConfig.js").TextConfig} TextConfig
 */

/**
 * @typedef {object} BoxStruct
 * @property {Point} leftBottomCorner
 * @property {Length} width
 * @property {Length} height
 */

/**
 * @typedef {object} OverflowCalcArgs
 * @property {BoxStruct} parent
 * @property {BoxStruct} child
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
    const rightBorder = box.leftBottomCorner.x.add(box.width);
    const leftBorder = box.leftBottomCorner.x;
    const topBorder = box.leftBottomCorner.y.add(box.height);
    const bottomBorder = box.leftBottomCorner.y;

    const parent = args.parent;
    const parentRightBorder = parent.leftBottomCorner.x.add(parent.width);
    const parentLeftBorder = parent.leftBottomCorner.x;
    const parentTopBorder = parent.leftBottomCorner.y.add(parent.height);
    const parentBottomBorder = parent.leftBottomCorner.y;

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
