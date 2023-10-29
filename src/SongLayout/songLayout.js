import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../Drawing/PrimitiveBoxes/TextBox.js";
import { Song } from "../Song/Song.js";
import { AtLeastBox } from "../Drawing/Boxes/AtLeastBox.js";
import { SongLine } from "../Song/SongLine.js";
import { isInside } from "../Drawing/BoxMeasuringUtils.js";
import { Length } from "../Shared/Length.js";

/**
 * @typedef {import("../Drawing/Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("../Drawing/Geometry.js").BoxGenerator} BoxGen
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
    if (simpleResult.every((b) => isInside(b.rectangle, rect))) {
      return simpleResult;
    }
    return songLayoutDense(song, layoutConfig, rect);
  }
  const doubleLineResult = songLayoutDoubleLine(song, layoutConfig, rect);
  if (doubleLineResult.length < simpleResult.length) {
    if (doubleLineResult.every((b) => isInside(b.rectangle, rect))) {
      return doubleLineResult;
    }
  }
  return simpleResult;
}
/**
 * @template Content
 * @template Style
 * @param {Content[]} contents
 * @param {{layout:(content:Content, style:Style, bounds:Rectangle)=> Box, sectionDistance:Length, style:Style}} style
 * @param {BoxGen} boundsGen
 * @returns {Box[]}
 */
function stackLayout(contents, style, boundsGen) {
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

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayoutSimple(song, layoutConfig, rect) {
  let fstPage = AtLeastBox.fromRect(rect);

  const pointer = rect.getPointAt({ x: "center", y: "top" });
  const titleBox = new TextBox(song.heading, layoutConfig.titleTextConfig);
  titleBox.setPosition({
    pointOnRect: { x: "center", y: "top" },
    pointOnGrid: pointer,
  });
  fstPage.appendChild(titleBox);

  const begin = fstPage.rectangle
    .getPoint("left", "top")
    .moveDown(titleBox.rectangle.height)
    .moveDown(titleBox.rectangle.height);

  /** @type {BoxGen} */
  const boundsGen = {
    /**
     * @param {number} index
     * @returns {Rectangle}
     */
    get: (index) => {
      if (index === 0) {
        return begin.span(rect.getPoint("right", "bottom"));
      }
      return rect;
    },
  };

  const x = stackLayout(
    song.sections,
    {
      layout: songSection,
      sectionDistance: layoutConfig.sectionDistance,
      style: layoutConfig,
    },
    boundsGen
  );
  if (x[0]) {
    fstPage.appendChild(x[0]);
  }

  return [fstPage, ...x.slice(1)];
}

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayoutDoubleLine(song, layoutConfig, rect) {
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

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayoutDense(song, layoutConfig, rect) {
  return songLayoutSimple(song, layoutConfig, rect);
}
