import { PointImpl } from "./Figures/PointImpl.js";
import { ArragmentBox } from "./Boxes/ArrangementBox.js";

/**
 * @typedef {import("./Geometry.js").Rectangle} Rectangle
 * @typedef {import("./Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").RectangleGenerator} BoxGenerator
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
      result.push(ArragmentBox.undboundBoxGroup(partialResult.children));
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
    return ArragmentBox.undboundBoxGroup(
      drawChildrenFn(content, config, drawingStartPoint)
    );
  };
}
