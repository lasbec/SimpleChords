import { AtLeastBox } from "../Boxes/AtLeastBox.js";
import { Length } from "../../Shared/Length.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").RectangleGenerator} RectGen
 * @typedef {import("../Geometry.js").Box} Box
 */

/**
 * @template Content
 * @template Style
 * @param {Content[]} contents
 * @param {{layout:(content:Content, style:Style, bounds:Rectangle)=> Box, sectionDistance:Length, style:Style}} style
 * @param {RectGen} boundsGen
 * @returns {Box[]}
 */
export function stackLayout(contents, style, boundsGen) {
  let pageCount = 0;
  let currPage = AtLeastBox.fromRect(boundsGen.get(pageCount));
  pageCount += 1;

  /** @type {Box[]} */
  const result = [currPage];

  let leftBottomOfLastSection = currPage.rectangle.getPoint("left", "top");
  for (const cnt of contents) {
    const bounds = leftBottomOfLastSection.span(
      currPage.rectangle.getPoint("right", "bottom")
    );
    const currBox = style.layout(cnt, style.style, bounds);

    const sectionExeedsPage = currBox.rectangle
      .getPoint("left", "bottom")
      .isLowerThan(currPage.rectangle.getPoint("left", "bottom"));
    if (sectionExeedsPage) {
      currPage = AtLeastBox.fromRect(boundsGen.get(pageCount));
      pageCount += 1;
      result.push(currPage);
      currBox.setPosition({
        pointOnRect: { x: "left", y: "top" },
        pointOnGrid: currPage.rectangle.getPoint("left", "top"),
      });
    }
    currPage.appendChild(currBox);
    leftBottomOfLastSection = currBox.rectangle
      .getPoint("left", "bottom")
      .moveDown(style.sectionDistance);
  }
  return result;
}
