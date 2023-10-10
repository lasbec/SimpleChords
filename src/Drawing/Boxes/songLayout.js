import { MutableBoxPointer } from "../BoxPointer.js";
import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../PrimitiveBoxes/TextBox.js";
import { TextConfig } from "../TextConfig.js";
import { Length } from "../../Length.js";
import { Song } from "../../Song.js";
import { MutableFreePointer } from "../FreePointer.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../../SchemaWrapper.js").LayoutConfig} LayoutConfig
 */

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {MutableBoxPointer} _pointer
 * @returns {Box[]}
 */
export function layOutSongOnNewPage(song, layoutConfig, _pointer) {
  /** @type {Rectangle} */
  const rect = _pointer.box.rectangle;

  const lyricLineHeight = layoutConfig.lyricTextConfig.lineHeight;
  const titleBox = drawTitle(
    song,
    rect,
    layoutConfig.topMargin,
    layoutConfig.titleTextConfig
  );
  _pointer.box.appendChild(titleBox);
  const pointer = MutableBoxPointer.atBox("left", "bottom", titleBox).onPage();

  pointer.moveDown(lyricLineHeight);
  pointer.moveToBorder("left").moveRight(layoutConfig.leftMargin);

  const rightBottomPointer = pointer
    .onPage()
    .moveToBorder("bottom")
    .moveToBorder("right")
    .moveUp(layoutConfig.bottomMargin)
    .moveLeft(layoutConfig.rightMargin);
  const lyricBox = pointer.span(rightBottomPointer);
  let lyricPointer = MutableBoxPointer.atBox("left", "top", lyricBox);

  /** @type {Box[]} */
  const result = [titleBox];
  for (const section of song.sections) {
    const sectionBox = songSection(section, layoutConfig);

    sectionBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: MutableFreePointer.fromPoint(lyricPointer),
    });

    const sectionWillExeedPage = sectionBox.rectangle
      .getPointAt({ x: "left", y: "bottom" })
      .isLowerThan(
        lyricPointer.box.rectangle.getPointAt({ x: "left", y: "bottom" })
      );
    if (sectionWillExeedPage) {
      const leftTopCorner = lyricPointer
        .nextPageAt("left", "top")
        .moveDown(layoutConfig.topMargin)
        .moveRight(layoutConfig.leftMargin);
      const rightBottomCorner = leftTopCorner
        .clone()
        .moveToBorder("bottom")
        .moveToBorder("right")
        .moveUp(layoutConfig.topMargin)
        .moveLeft(layoutConfig.rightMargin);
      const lyricBox = leftTopCorner.span(rightBottomCorner);
      lyricPointer = MutableBoxPointer.atBox("left", "top", lyricBox);
    }

    sectionBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: MutableFreePointer.fromPoint(lyricPointer),
    });
    lyricPointer.box.appendChild(sectionBox);

    result.push(sectionBox);
    lyricPointer = MutableBoxPointer.fromPoint(
      sectionBox.rectangle.getPoint("left", "bottom"),
      sectionBox
    ).onPage();
    lyricPointer.moveDown(layoutConfig.sectionDistance);
  }
  return result;
}

/**
 * @param {Song} song
 * @param {Rectangle} page
 * @param {Length} topMargin
 * @param {TextConfig} style
 */
export function drawTitle(song, page, topMargin, style) {
  const pointer = page
    .getPointAt({ x: "center", y: "top" })
    .moveDown(topMargin);
  const textBox = new TextBox(song.heading, style);
  textBox.setPosition({
    pointOnRect: { x: "center", y: "top" },
    pointOnGrid: pointer,
  });
  return textBox;
}
