import { FreePointer } from "./FreePointer.js";
import { Length } from "../Length.js";
import { minimalBoundingBox } from "./BoxMeasuringUtils.js";
import { AbstractPrimitiveBox } from "./AbstractPrimitiveBox.js";
import { PDFPage } from "pdf-lib";
import { drawDebugBox } from "./BoxDrawingUtils.js";

/**
 * @typedef {import("./Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("./Geometry.js").Box} Box
 */

export class AbstractHOBox extends AbstractPrimitiveBox {
  /**
   * @param {(startPoint: FreePointer)=>Box[]} initChildren
   */
  constructor(initChildren) {
    const children = initChildren(FreePointer.origin());
    const mbb = minimalBoundingBox(children);
    super(
      mbb || {
        width: Length.zero,
        height: Length.zero,
      },
      mbb?.getAnyPosition() || {
        x: "left",
        y: "top",
        point: FreePointer.origin(),
      }
    );
    this.children = children;
    for (const child of children) {
      child.setParent(this);
    }
  }

  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const oldCenter = this.getPoint("center", "center");
    super.setPosition({
      ...position,
      point: position.point.clone(),
    });
    const newCenter = this.getPoint("center", "center");
    const xMove = newCenter.x.sub(oldCenter.x);
    const yMove = newCenter.y.sub(oldCenter.y);

    for (const child of this.children) {
      const newChildCenter = child.getPoint("center", "center");
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
    for (const child of this.children) {
      drawDebugBox(page, child);
      child.drawToPdfPage(page);
    }
  }
}
