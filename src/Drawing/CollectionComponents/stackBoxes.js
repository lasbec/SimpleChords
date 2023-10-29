import { AtLeastBox } from "../Boxes/AtLeastBox.js";
import { Length } from "../../Shared/Length.js";

/**
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").RectangleGenerator} RectGen
 * @typedef {import("../Geometry.js").Box} Box
 */

/**
 * @param {Box[]} boxes
 * @param {{sectionDistance:Length, alignment:XStartPosition }} style
 * @param {RectGen} boundsGen
 * @returns {Box[]}
 */
export function stackBoxes(boxes, style, boundsGen) {
  let pageCount = 0;
  let currPage = AtLeastBox.fromRect(boundsGen.get(pageCount));
  pageCount += 1;

  /** @type {Box[]} */
  const result = [currPage];

  let bottomOfLastSection = currPage.rectangle.getPoint(style.alignment, "top");
  for (const box of boxes) {
    box.setPosition({
      pointOnRect: { x: style.alignment, y: "top" },
      pointOnGrid: bottomOfLastSection,
    });
    const sectionExeedsPage = box.rectangle
      .getPoint("left", "bottom")
      .isLowerThan(currPage.rectangle.getPoint("left", "bottom"));
    if (sectionExeedsPage) {
      currPage = AtLeastBox.fromRect(boundsGen.get(pageCount));
      pageCount += 1;
      result.push(currPage);
      box.setPosition({
        pointOnRect: { x: style.alignment, y: "top" },
        pointOnGrid: currPage.rectangle.getPoint(style.alignment, "top"),
      });
    }
    currPage.appendChild(box);
    bottomOfLastSection = box.rectangle
      .getPoint(style.alignment, "bottom")
      .moveDown(style.sectionDistance);
  }
  return result;
}
