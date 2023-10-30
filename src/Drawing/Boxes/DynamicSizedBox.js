import { MutableFreePointer } from "../FreePointer.js";
import { Length } from "../../Shared/Length.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { AbstractPrimitiveBox } from "./AbstractPrimitiveBox.js";
import { PDFPage } from "pdf-lib";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { BoxOverflows } from "../BoxOverflow.js";
import { FixedSizeBox } from "./FixedSizeBox.js";
import { FreeBox } from "../FreeBox.js";

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

export class DynamicSizedBox extends FixedSizeBox {
  /**
   * @param {Box[]} children
   */
  constructor(children) {
    super(
      FreeBox.fromCorners(
        MutableFreePointer.origin(),
        MutableFreePointer.origin()
      )
    );
    for (const child of children) {
      this.appendChild(child);
    }
  }

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
    box.parent = this;
    const mbb = minimalBoundingBox(this.children.map((c) => c.rectangle));
    this.rectangle =
      mbb ||
      FreeBox.fromCorners(
        MutableFreePointer.origin(),
        MutableFreePointer.origin()
      );
    this.width = mbb?.width || Length.zero;
    this.height = mbb?.height || Length.zero;
  }
}
