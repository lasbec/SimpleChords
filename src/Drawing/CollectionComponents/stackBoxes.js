import { ArragmentBox } from "../Boxes/ArrangementBox.js";
import { Length } from "../../Shared/Length.js";
import { create } from "domain";

/**
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").RectangleGenerator} RectGen
 * @typedef {import("../Geometry.js").Box} Box
 */
/**
 * @typedef {{sectionDistance: Length;alignment: XStartPosition;}} StackBlockStyle
 */

/**
 * @param {{content:Box, style:StackBlockStyle} | Box} x
 * @returns {x is {content:Box, style:StackBlockStyle}}
 */
function isContentStylePair(x) {
  const keys = Object.keys(x);
  return (
    keys.length === 2 && keys.includes("content") && keys.includes("style")
  );
}
/**
 * @param {({content:Box, style:StackBlockStyle} | Box)[]} boxes
 * @param {StackBlockStyle} defaultStyle
 * @param {RectGen} boundsGen
 * @returns {Box[]}
 */
export function stack(boxes, defaultStyle, boundsGen) {
  let currPage = ArragmentBox.fromRect(boundsGen.next());

  /** @type {Box[]} */
  const result = [currPage];

  let bottomOfLastSection = currPage.rectangle.getBorderHorizontal("top");
  for (const _box of boxes) {
    const box = isContentStylePair(_box) ? _box.content : _box;
    const alignment = isContentStylePair(_box)
      ? _box.style.alignment
      : defaultStyle.alignment;
    const sectionDistance = isContentStylePair(_box)
      ? _box.style.sectionDistance
      : defaultStyle.sectionDistance;

    function refPoint() {
      return currPage.rectangle
        .getPoint(alignment, "top")
        .clone()
        .alignVerticalWith(bottomOfLastSection);
    }
    box.setPosition({
      pointOnRect: { x: alignment, y: "top" },
      pointOnGrid: refPoint(),
    });
    const sectionExeedsPage = box.rectangle
      .getPoint("left", "bottom")
      .isLowerOrEq(currPage.rectangle.getPoint("left", "bottom"));
    if (sectionExeedsPage) {
      currPage = ArragmentBox.fromRect(boundsGen.next());
      result.push(currPage);
      bottomOfLastSection = currPage.rectangle.getBorderHorizontal("top");
      box.setPosition({
        pointOnRect: { x: defaultStyle.alignment, y: "top" },
        pointOnGrid: refPoint(),
      });
    }
    currPage.appendChild(box);
    bottomOfLastSection = box.rectangle
      .getBorderHorizontal("bottom")
      .moveDown(sectionDistance);
  }
  return result;
}
