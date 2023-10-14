import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../Drawing/PrimitiveBoxes/TextBox.js";
import { Song } from "../Song/Song.js";
import { AtLeastBox } from "../Drawing/Boxes/AtLeastBox.js";
import { SongLine } from "../Song/SongLine.js";
import { isInside } from "../Drawing/BoxMeasuringUtils.js";

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
  const simpleResult = songLayoutSimple(song, layoutConfig, rect);
  if (simpleResult.length <= 1) {
    return simpleResult;
  }
  const denseResult = songLayoutDense(song, layoutConfig, rect);
  if (denseResult.length < simpleResult.length) {
    if (denseResult.every((b) => isInside(b.rectangle, rect))) {
      return denseResult;
    }
  }
  return simpleResult;
}

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayoutSimple(song, layoutConfig, rect) {
  let currPage = AtLeastBox.fromRect(rect);

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

    const sectionExeedsPage = sectionBox.rectangle
      .getPoint("left", "bottom")
      .isLowerThan(currPage.rectangle.getPoint("left", "bottom"));
    if (sectionExeedsPage) {
      currPage = AtLeastBox.fromRect(rect);
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

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayoutDense(song, layoutConfig, rect) {
  return songLayoutSimple(
    new Song(
      song.heading,
      song.sections.map((s) => ({
        type: s.type,
        lines: doubleSongLines(s.lines),
      }))
    ),
    layoutConfig,
    rect
  );
}

/**
 * @param {SongLine[]} lines
 * @returns {SongLine[]}
 */
function doubleSongLines(lines) {
  /** @type {SongLine[]} */
  const result = [];
  lines.forEach((l, i) => {
    const next = lines[i + 1];
    if (i % 2 == 0 && next) {
      result.push(l.concat([next]));
    }
  });
  if (lines.length % 2 == 1) {
    result.push(lines[lines.length - 1]);
  }
  return result;
}
