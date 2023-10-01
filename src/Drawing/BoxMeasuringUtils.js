import { Length } from "../Length.js";
import { FreePointer } from "./FreePointer.js";
/**
 * @typedef {import("./Geometry.js").XStartPosition} RelX
 * @typedef {import("./Geometry.js").YStartPosition} RelY
 */

/**
 * @typedef {object} GetPointArgs
 * @property {RelX} relX
 * @property {RelY} relY
 * @property {FreePointer} corner
 * @property {Length} width
 * @property {Length} height
 * @property {RelX} cornerX
 * @property {RelY} cornerY
 *
 */

/**
 * @param {GetPointArgs} args
 */
export function getPoint(args) {
  const result = args.corner.clone();

  const movePointerHorizontal = xMovementMap[`${args.cornerX}_to_${args.relX}`];
  movePointerHorizontal(args.width, result);

  const movePointerVertical = yMovementMap[`${args.cornerY}_to_${args.relY}`];
  movePointerVertical(args.height, result);

  return result;
}

/**
 * @type {Record<`${RelX}_to_${RelX}`, (width:Length, pointer: FreePointer)=> void>}
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
    pointer.moveLeft(width);
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
 * @type {Record<`${RelY}_to_${RelY}`, (height:Length, pointer: FreePointer)=> void>}
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
