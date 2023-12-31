import { rgb } from "pdf-lib";
import { LEN, Length } from "../Shared/Length.js";
import { PDFPage } from "pdf-lib";
import { DebugMode } from "./DebugMode.js";
/**
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("./TextConfig.js").TextConfig} TextConfig
 */

/**
 * @typedef {object} OverflowCalcArgs
 * @property {Box | null} parent
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
    if (!args.parent) {
      return new BoxOverflows({
        right: Length.zero,
        left: Length.zero,
        top: Length.zero,
        bottom: Length.zero,
      });
    }
    const box = args.child;
    const leftBottomCorner = box.rectangle.getPoint("left", "bottom");
    const rightBorder = leftBottomCorner.x.add(box.rectangle.width);
    const leftBorder = leftBottomCorner.x;
    const topBorder = leftBottomCorner.y.add(box.rectangle.height);
    const bottomBorder = leftBottomCorner.y;

    const parent = args.parent;
    const parentLeftBottomCorner = parent.rectangle.getPoint("left", "bottom");
    const parentRightBorder = parentLeftBottomCorner.x.add(
      parent.rectangle.width
    );
    const parentLeftBorder = parentLeftBottomCorner.x;
    const parentTopBorder = parentLeftBottomCorner.y.add(
      parent.rectangle.height
    );
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
  /** @param {Box} box */
  static assertBoxIsInsideParent(box) {
    const overflows = BoxOverflows.from({ child: box, parent: box.parent });
    if (!overflows.isEmpty()) {
      throw new Error(overflows.toString());
    }
  }

  /**
   * @param {PDFPage} page
   * @param {Box} box
   */
  static doOverflowManagement(page, box) {
    if (!DebugMode.isOn) BoxOverflows.assertBoxIsInsideParent(box);
    const overflows = BoxOverflows.from({ child: box, parent: box.parent });
    if (overflows.isEmpty()) return;
    BoxOverflows.drawOverflowMarker(page, box, overflows);
    console.error("Overflow detecded", overflows.toString());
  }

  /**
   * @param {PDFPage} page
   * @param {Box} box
   * @param {BoxOverflows} overflow
   */
  static drawOverflowMarker(page, box, overflow) {
    page.drawRectangle({
      ...box.rectangle.getPoint("left", "bottom").rawPointIn("pt"),
      width: box.rectangle.width.in("pt"),
      height: box.rectangle.height.in("pt"),
      color: rgb(1, 0, 1),
      opacity: 0.5,
    });

    if (overflow.left) {
      const leftBottom = box.rectangle.getPoint("left", "bottom");
      const height = box.rectangle.height;
      const width = overflow.left;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: height.in("pt"),
        color: rgb(0, 1, 0),
      });
    }

    if (overflow.right) {
      const leftBottom = box.rectangle
        .getPoint("right", "bottom")
        .moveLeft(overflow.right);
      const height = box.rectangle.height;
      const width = overflow.right;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: height.in("pt"),
        color: rgb(0, 1, 0),
      });
    }

    if (overflow.top) {
      const leftBottom = box.rectangle
        .getPoint("left", "top")
        .moveDown(overflow.top);
      const height = overflow.top;
      const width = box.rectangle.width;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: height.in("pt"),
        color: rgb(0, 1, 0),
      });
    }

    if (overflow.bottom) {
      const leftBottom = box.rectangle.getPoint("left", "bottom");
      const heigth = overflow.bottom;
      const width = box.rectangle.width;
      page.drawRectangle({
        ...leftBottom.rawPointIn("pt"),
        width: width.in("pt"),
        height: heigth.in("pt"),
        color: rgb(0, 1, 0),
      });
    }
  }
}
