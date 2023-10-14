import { MutableBoxPointer } from "../Drawing/BoxPointer.js";
import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../Drawing/PrimitiveBoxes/TextBox.js";
import { TextConfig } from "../Drawing/TextConfig.js";
import { Length } from "../Shared/Length.js";
import { Song } from "../Song/Song.js";
import { MutableFreePointer } from "../Drawing/FreePointer.js";
import { FreeBox } from "../Drawing/FreeBox.js";
import { PlainBox } from "../Drawing/Boxes/PlainBox.js";

/**
 * @typedef {import("../Drawing/Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 */

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayout(song, layoutConfig, rect) {
  let currPage = PlainBox.fromRect(rect);

  const pointer = rect.getPointAt({ x: "center", y: "top" });
  const titleBox = new TextBox(song.heading, layoutConfig.titleTextConfig);
  titleBox.setPosition({
    pointOnRect: { x: "center", y: "top" },
    pointOnGrid: pointer,
  });
  currPage.appendChild(titleBox);

  /** @type {Box[]} */
  const result = [currPage];

  let leftBottomOfLastSection = currPage.rectangle
    .getPoint("left", "top")
    .moveDown(titleBox.rectangle.height)
    .moveDown(titleBox.rectangle.height);
  for (const section of song.sections) {
    const lyricBox = leftBottomOfLastSection.span(
      currPage.rectangle.getPoint("right", "bottom")
    );
    const sectionBox = songSection(section, layoutConfig, lyricBox);

    if (
      sectionBox.rectangle
        .getPoint("left", "bottom")
        .isLowerThan(currPage.rectangle.getPoint("left", "bottom"))
    ) {
      currPage = PlainBox.fromRect(rect);
      result.push(currPage);
      sectionBox.setPosition({
        pointOnRect: { x: "left", y: "top" },
        pointOnGrid: currPage.rectangle.getPoint("left", "top"),
      });
    }
    currPage.appendChild(sectionBox);
    leftBottomOfLastSection = sectionBox.rectangle
      .getPoint("left", "bottom")
      .moveDown(layoutConfig.sectionDistance);
  }
  return result;
}
