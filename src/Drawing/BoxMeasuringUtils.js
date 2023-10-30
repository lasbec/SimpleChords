import { Length } from "../Shared/Length.js";
import { FreeBox } from "./FreeBox.js";
import { MutableFreePointer } from "./FreePointer.js";

/**
 * @typedef {import("./Geometry.js").RectanglePlacement} RectanglePlacement
 * @typedef {import("./Geometry.js").XStartPosition} RelX
 * @typedef {import("./Geometry.js").YStartPosition} RelY
 * @typedef {import("./Geometry.js").Rectangle} Rectangle
 */

/**
 * @typedef {object} GetPointArgs
 * @property {RelX} targetX
 * @property {RelY} targetY
 * @property {RectanglePlacement} corner
 * @property {Length} width
 * @property {Length} height
 */

/**
 *
 * @param {Rectangle} inner
 * @param {Rectangle} outer
 */
export function isInside(inner, outer) {
  const innerLeftTop = inner.getPoint("left", "top");
  const innerRightBottom = inner.getPoint("right", "bottom");
  const outerLeftTop = outer.getPoint("left", "top");
  const outerRightBottom = outer.getPoint("right", "bottom");
  return (
    innerLeftTop.isRightOrEq(outerLeftTop) &&
    innerLeftTop.isLowerOrEq(outerLeftTop) &&
    innerRightBottom.isLeftOrEq(outerRightBottom) &&
    innerRightBottom.isHigherOrEq(outerRightBottom)
  );
}

/**
 * @param {GetPointArgs} args
 */
export function getPoint(args) {
  const result = args.corner.pointOnGrid.clone();

  const movePointerHorizontal =
    xMovementMap[`${args.corner.pointOnRect.x}_to_${args.targetX}`];
  movePointerHorizontal(args.width, result);

  const movePointerVertical =
    yMovementMap[`${args.corner.pointOnRect.y}_to_${args.targetY}`];
  movePointerVertical(args.height, result);

  return result;
}

/**
 * @type {Record<`${RelX}_to_${RelX}`, (width:Length, pointer: MutableFreePointer)=> void>}
 */
const xMovementMap = {
  // from left
  left_to_left(width, pointer) {},
  left_to_center(width, pointer) {
    pointer.moveRight(width.mul(1 / 2));
  },
  left_to_right(width, pointer) {
    pointer.moveRight(width);
  },
  // from center
  center_to_left(width, pointer) {
    pointer.moveLeft(width.mul(1 / 2));
  },
  center_to_center(width, pointer) {},
  center_to_right(width, pointer) {
    pointer.moveRight(width.mul(1 / 2));
  },
  // from right
  right_to_left(width, pointer) {
    pointer.moveRight(width);
  },
  right_to_center(width, pointer) {
    pointer.moveLeft(width.mul(1 / 2));
  },
  right_to_right(width, pointer) {},
};

/**
 * @type {Record<`${RelY}_to_${RelY}`, (height:Length, pointer: MutableFreePointer)=> void>}
 */
const yMovementMap = {
  // from bottom
  bottom_to_bottom(height, pointer) {},
  bottom_to_center(height, pointer) {
    pointer.moveUp(height.mul(1 / 2));
  },
  bottom_to_top(height, pointer) {
    pointer.moveUp(height);
  },
  // from center
  center_to_bottom(height, pointer) {
    pointer.moveDown(height.mul(1 / 2));
  },
  center_to_center(height, pointer) {},
  center_to_top(height, pointer) {
    pointer.moveUp(height.mul(1 / 2));
  },
  // from top
  top_to_bottom(height, pointer) {
    pointer.moveDown(height);
  },
  top_to_center(height, pointer) {
    pointer.moveDown(height.mul(1 / 2));
  },
  top_to_top(height, pointer) {},
};

/**
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Geometry.js").Box} Box
 */

/**
 * @param {Rectangle[]} boxes
 * @returns {FreeBox | undefined}
 */
export function minimalBoundingBox(boxes) {
  const fst = boxes[0];
  if (!boxes) return;
  let leftTop = fst.getPoint("left", "top");
  let rightBottom = fst.getPoint("right", "bottom");

  for (const box of boxes) {
    leftTop = leftTop.span(box.getPoint("left", "top")).getPoint("left", "top");
    rightBottom = rightBottom
      .span(box.getPoint("right", "bottom"))
      .getPoint("right", "bottom");
  }
  return FreeBox.fromCorners(leftTop, rightBottom);
}
