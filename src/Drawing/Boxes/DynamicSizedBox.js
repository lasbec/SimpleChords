import { PointImpl } from "../Figures/PointImpl.js";
import { Length } from "../../Shared/Length.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { FixedSizeBox } from "./FixedSizeBox.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
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
 * @param {(content:Content, config:Config, drawingStartPoint:PointImpl) => Box[]} drawChildrenFn
 */
export function decorateAsBox(drawChildrenFn) {
  /**
   * @param {Content} content
   * @param {Config} config
   * @param {PointImpl=} drawingStartPoint
   * @returns {Box}
   */
  return (content, config, drawingStartPoint) => {
    drawingStartPoint = drawingStartPoint?.clone() || PointImpl.origin();
    return new DynamicSizedBox(
      drawChildrenFn(content, config, drawingStartPoint)
    );
  };
}

/** Unbounded (no startpoint), Arrangement, HOB, Mutable */
export class DynamicSizedBox extends FixedSizeBox {
  /**
   * @param {Box[]} children
   */
  constructor(children) {
    super(RectangleImpl.fromCorners(PointImpl.origin(), PointImpl.origin()));
    for (const child of children) {
      this.appendChild(child);
    }
  }

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
    box.parent = this;
    const mbb = minimalBoundingBox(this.children.map((c) => c.rectangle));
    this._rectangle =
      mbb || RectangleImpl.fromCorners(PointImpl.origin(), PointImpl.origin());
    this.width = mbb?.width || Length.zero;
    this.height = mbb?.height || Length.zero;
  }
}
