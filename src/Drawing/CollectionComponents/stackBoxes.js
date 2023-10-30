import { MinBoundBox } from "../Boxes/MinBoundBox.js";
import { Length } from "../../Shared/Length.js";

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
export function stackBoxes(boxes, defaultStyle, boundsGen) {
  let pageCount = 0;
  let currPage = MinBoundBox.fromRect(boundsGen.get(pageCount));
  pageCount += 1;

  /** @type {Box[]} */
  const result = [currPage];

  let bottomOfLastSection = currPage.rectangle.getBorder("top");
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
        .setHeight(bottomOfLastSection);
    }
    box.setPosition({
      pointOnRect: { x: alignment, y: "top" },
      pointOnGrid: refPoint(),
    });
    const sectionExeedsPage = box.rectangle
      .getPoint("left", "bottom")
      .isLowerOrEq(currPage.rectangle.getPoint("left", "bottom"));
    if (sectionExeedsPage) {
      currPage = MinBoundBox.fromRect(boundsGen.get(pageCount));
      pageCount += 1;
      result.push(currPage);
      bottomOfLastSection = currPage.rectangle.getBorder("top");
      box.setPosition({
        pointOnRect: { x: defaultStyle.alignment, y: "top" },
        pointOnGrid: refPoint(),
      });
    }
    currPage.appendChild(box);
    bottomOfLastSection = box.rectangle
      .getBorder("bottom")
      .sub(sectionDistance);
  }
  return result;
}
