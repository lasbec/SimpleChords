import { MutableFreePointer } from "./FreePointer.js";
import { Length } from "../Length.js";
import { minimalBoundingBox } from "./BoxMeasuringUtils.js";
import { AbstractPrimitiveBox } from "./AbstractPrimitiveBox.js";
import { PDFPage } from "pdf-lib";
import { drawDebugBox } from "./BoxDrawingUtils.js";
import { BoxOverflows } from "./BoxOverflow.js";

/**
 * @typedef {import("./Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("./Geometry.js").Box} Box
 */

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
    return new HigherOrderBox(
      drawChildrenFn(content, config, drawingStartPoint)
    );
  };
}

export class HigherOrderBox extends AbstractPrimitiveBox {
  /**
   * @param {Box[]} children
   */
  constructor(children) {
    const mbb = minimalBoundingBox(children);
    super(
      mbb || {
        width: Length.zero,
        height: Length.zero,
      },
      mbb?.getAnyPosition() || {
        x: "left",
        y: "top",
        point: MutableFreePointer.origin(),
      }
    );
    this.children = children;
    for (const child of children) {
      child.setParent(this);
    }
  }

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
    box.parent = this;
    const mbb = minimalBoundingBox(this.children);
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
      point: position.point.clone(),
    });
    const newCenter = this.rectangle.getPoint("center", "center");
    const xMove = newCenter.x.sub(oldCenter.x);
    const yMove = newCenter.y.sub(oldCenter.y);

    for (const child of this.children) {
      const newChildCenter = child.rectangle.getPoint("center", "center");
      newChildCenter.x = newChildCenter.x.add(xMove);
      newChildCenter.y = newChildCenter.y.add(yMove);
      child.setPosition({
        x: "center",
        y: "center",
        point: newChildCenter,
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
