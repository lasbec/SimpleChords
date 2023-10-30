import { MutableFreePointer } from "../FreePointer.js";
import { Length } from "../../Shared/Length.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { AbstractPrimitiveBox } from "./AbstractPrimitiveBox.js";
import { PDFPage } from "pdf-lib";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { BoxOverflows } from "../BoxOverflow.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").RectangleGenerator} BoxGenerator
 */

/**
 * @template Content
 * @template Config
 * @param {(content:Content, config:Config, box:Rectangle) => {children:Box[], rest?:Content}} drawChildrenFn
 */
export function decorateAsComponent(drawChildrenFn) {
  /**
   * @param {Content} content
   * @param {Config} config
   * @param {BoxGenerator} boxGen
   * @returns {Box[]}
   */
  return (content, config, boxGen) => {
    /** @type {Box[]} */
    const result = [];
    /** @type {Content | undefined} */
    let rest = content;
    let pageCount = 0;
    while (rest !== undefined) {
      const partialResult = drawChildrenFn(rest, config, boxGen.get(pageCount));
      pageCount += 1;
      result.push(new DynamicSizedBox(partialResult.children));
      rest = partialResult.rest;
    }
    return result;
  };
}

/**
 * @template Content
 * @template Config
 * @param {(content:Content, config:Config, drawingStartPoint:MutableFreePointer) => Box[]} drawChildrenFn
 */
export function decorateAsBox(drawChildrenFn) {
  /**
   * @param {Content} content
   * @param {Config} config
   * @param {MutableFreePointer=} drawingStartPoint
   * @returns {Box}
   */
  return (content, config, drawingStartPoint) => {
    drawingStartPoint =
      drawingStartPoint?.clone() || MutableFreePointer.origin();
    return new DynamicSizedBox(
      drawChildrenFn(content, config, drawingStartPoint)
    );
  };
}

export class DynamicSizedBox extends AbstractPrimitiveBox {
  /**
   * @param {Box[]} children
   */
  constructor(children) {
    const mbb = minimalBoundingBox(children.map((c) => c.rectangle));
    super(
      mbb || {
        width: Length.zero,
        height: Length.zero,
      },
      mbb?.getAnyPosition() || {
        pointOnRect: { x: "left", y: "top" },
        pointOnGrid: MutableFreePointer.origin(),
      }
    );
    this.children = children;
    for (const child of children) {
      child.parent = this;
    }
  }

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
    box.parent = this;
    const mbb = minimalBoundingBox(this.children.map((c) => c.rectangle));
    this.width = mbb?.width || Length.zero;
    this.height = mbb?.height || Length.zero;
  }

  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const oldCenter = this.rectangle.getPoint("center", "center");
    super.setPosition({
      ...position,
      pointOnGrid: position.pointOnGrid,
    });
    const newCenter = this.rectangle.getPoint("center", "center");
    const xMove = newCenter.x.sub(oldCenter.x);
    const yMove = newCenter.y.sub(oldCenter.y);

    for (const child of this.children) {
      const newChildCenter = child.rectangle.getPoint("center", "center");
      newChildCenter.x = newChildCenter.x.add(xMove);
      newChildCenter.y = newChildCenter.y.add(yMove);
      child.setPosition({
        pointOnRect: { x: "center", y: "center" },
        pointOnGrid: newChildCenter,
      });
    }
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    BoxOverflows.doOverflowManagement(page, this);
    for (const child of this.children) {
      drawDebugBox(page, child);
      child.drawToPdfPage(page);
    }
  }
}
