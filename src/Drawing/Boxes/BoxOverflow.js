import { Length } from "../../Length.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
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
    return (
      this.top.isZero() &&
      this.bottom.isZero() &&
      this.left.isZero() &&
      this.right.isZero()
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
      result.push("bottom");
    }
    if (this.top.gtz()) {
      result.push("top");
    }
    if (this.left.gtz()) {
      result.push("left");
    }
    if (this.right.gtz()) {
      result.push("right");
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
