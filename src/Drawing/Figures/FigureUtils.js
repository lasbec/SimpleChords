import { Length } from "../../Shared/Length.js";
import { RectangleImpl } from "./RectangleImpl.js";
import { PointImpl } from "./PointImpl.js";
import { PartialRectangleImpl } from "./PartialRectangleImpl.js";
import { VLineImpl } from "./VLineImpl.js";
import { HLineImpl } from "./HLineImpl.js";
import { PointCompare } from "../CoordinateSystemSpecifics/Compare.js";
import { BoundsImpl } from "./BoundsImpl.js";

/**
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 * @typedef {import("../Geometry.js").XStartPosition} RelX
 * @typedef {import("../Geometry.js").YStartPosition} RelY
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
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
 * @typedef {object} GetPointArgs
 * @property {RelX} targetX
 * @property {RelY} targetY
 * @property {ReferencePoint} corner
 * @property {Length} width
 * @property {Length} height
 */

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
 * @type {Record<`${RelX}_to_${RelX}`, (width:Length, pointer: PointImpl)=> void>}
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
 * @type {Record<`${RelY}_to_${RelY}`, (height:Length, pointer: PointImpl)=> void>}
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
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 */

/**
 * @param {Rectangle[]} boxes
 * @returns {RectangleImpl | undefined}
 */
export function minimalBoundingRectangle(boxes) {
  const fst = boxes[0];
  if (!fst) return;
  let leftTop = fst.getPoint("left", "top");
  let rightBottom = fst.getPoint("right", "bottom");

  for (const box of boxes) {
    leftTop = leftTop.span(box.getPoint("left", "top")).getPoint("left", "top");
    rightBottom = rightBottom
      .span(box.getPoint("right", "bottom"))
      .getPoint("right", "bottom");
  }
  return RectangleImpl.fromCorners(leftTop, rightBottom);
}

/**
 * @typedef {import("../Geometry.js").PartialRectangle} PartialRectangle
 */

/**
 * @param {PartialRectangle} rect
 * @param {PartialRectangle[]} remaining
 * @returns {PartialRectangleImpl}
 */
export function minimalBoundingRectangleSafe(rect, ...remaining) {
  let left = rect.getBorderVertical("left");
  let right = rect.getBorderVertical("right");
  let top = rect.getBorderHorizontal("top");
  let bottom = rect.getBorderHorizontal("bottom");
  for (const p of remaining) {
    let leftCan = p.getBorderVertical("left");
    let rightCan = p.getBorderVertical("right");
    let topCan = p.getBorderHorizontal("top");
    let bottomCan = p.getBorderHorizontal("bottom");
    if (!left || leftCan?.isRightOrEq(left)) {
      left = leftCan;
    }
    if (!right || rightCan?.isLeftOrEq(right)) {
      right = rightCan;
    }
    if (!top || topCan?.isLowerOrEq(top)) {
      top = topCan;
    }
    if (!bottom || bottomCan?.isHigherOrEq(bottom)) {
      bottom = bottomCan;
    }
  }

  return PartialRectangleImpl.fromBorders({
    left,
    right,
    top,
    bottom,
  });
}

/**
 * @param {Rectangle} rect
 * @param {PartialRectangle[]} partials
 * @returns {RectangleImpl}
 */
export function interSectionSafe(rect, ...partials) {
  let left = rect.getBorderVertical("left");
  let right = rect.getBorderVertical("right");
  let top = rect.getBorderHorizontal("top");
  let bottom = rect.getBorderHorizontal("bottom");
  for (const p of partials) {
    let leftCan = p.getBorderVertical("left");
    let rightCan = p.getBorderVertical("right");
    let topCan = p.getBorderHorizontal("top");
    let bottomCan = p.getBorderHorizontal("bottom");
    if (leftCan?.isRightOrEq(left)) {
      left = leftCan;
    }
    if (rightCan?.isLeftOrEq(right)) {
      right = rightCan;
    }
    if (topCan?.isLowerOrEq(top)) {
      top = topCan;
    }
    if (bottomCan?.isHigherOrEq(bottom)) {
      bottom = bottomCan;
    }
  }

  return RectangleImpl.fromBorders({
    left,
    right,
    top,
    bottom,
  });
}

/**
 *
 * @param {Rectangle} finite
 * @param {PartialRectangle} partial
 */
function finite(finite, partial) {
  return RectangleImpl.fromBorders({
    left: partial.getBorderVertical("left") || finite.getBorderVertical("left"),
    right:
      partial.getBorderVertical("right") || finite.getBorderVertical("right"),
    top:
      partial.getBorderHorizontal("top") || finite.getBorderHorizontal("top"),
    bottom:
      partial.getBorderHorizontal("bottom") ||
      finite.getBorderHorizontal("bottom"),
  });
}

/**
 * @param {Rectangle} rectangle
 * @param {BoundsImpl} bounds
 */
export function fitIntoBounds(rectangle, bounds) {
  const upperBounds = PartialRectangleImpl.fromMaxBound(bounds);
  const lowerBounds = PartialRectangleImpl.fromMinBound(bounds);
  const extendedRectangle = finite(
    rectangle,
    minimalBoundingRectangleSafe(lowerBounds, rectangle)
  );
  return interSectionSafe(extendedRectangle, upperBounds);
}
