import { MutableBoxPointer } from "../BoxPointer.js";
import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../PrimitiveBoxes/TextBox.js";
import { TextConfig } from "../TextConfig.js";
import { Length } from "../../Length.js";
import { Song } from "../../Song.js";
import { WellKnownSectionType } from "../../SongChecker.js";
import { SongLine } from "../../SongLine.js";
import { MutableFreePointer } from "../FreePointer.js";
import { decorateAsBox } from "../HigherOrderBox.js";

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
    let onlyChordsSections = [
      WellKnownSectionType.Intro,
      WellKnownSectionType.Outro,
      WellKnownSectionType.Interlude,
    ];
    const sectionLines = onlyChordsSections.includes(section.type)
      ? drawSongSectionLinesOnlyChords(
          lyricPointer,
          section.lines,
          section.type + "   ",
          layoutConfig
        )
      : drawSongSectionLines(
          lyricPointer,
          section.lines,
          section.type,
          layoutConfig
        );
    result.push(...sectionLines);
    const lastLine = sectionLines[sectionLines.length - 1];
    if (lastLine) {
      lyricPointer = MutableBoxPointer.fromPoint(
        lastLine.rectangle.getPoint("left", "bottom"),
        lastLine
      ).onPage();
    }
    lyricPointer.moveDown(layoutConfig.sectionDistance);
  }
  return result;
}

/**
 * @param {MutableBoxPointer} pointer
 * @param {SongLine[]} songLines
 * @param {string} sectionType
 * @param {LayoutConfig} layoutConfig
 * @returns {Box[]}
 * */
export function drawSongSectionLines(
  pointer,
  songLines,
  sectionType,
  layoutConfig
) {
  /** @type {TextConfig} */
  const lyricStyle =
    sectionType === WellKnownSectionType.Chorus
      ? layoutConfig.chorusTextConfig
      : sectionType === WellKnownSectionType.Refrain
      ? layoutConfig.refTextConfig
      : layoutConfig.lyricTextConfig;
  const chordTextConfig = layoutConfig.chordTextConfig;

  const sectionBox = songSection(
    {
      type: sectionType,
      lines: songLines,
    },
    {
      chordsConfig: chordTextConfig,
      lyricConfig: lyricStyle,
    }
  );
  sectionBox.setPosition({
    pointOnRect: { x: "left", y: "top" },
    pointOnGrid: MutableFreePointer.fromPoint(pointer),
  });

  const sectionWillExeedPage = sectionBox.rectangle
    .getPointAt({ x: "left", y: "bottom" })
    .isLowerThan(pointer.box.rectangle.getPointAt({ x: "left", y: "bottom" }));
  if (sectionWillExeedPage) {
    const leftTopCorner = pointer
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
    pointer = MutableBoxPointer.atBox("left", "top", lyricBox);
  }

  sectionBox.setPosition({
    pointOnRect: { x: "left", y: "top" },
    pointOnGrid: MutableFreePointer.fromPoint(pointer),
  });
  pointer.box.appendChild(sectionBox);

  return [sectionBox];
}

/**
 * @param {MutableBoxPointer} pointer
 * @param {SongLine[]} songLines
 * @param {string} title
 * @param {LayoutConfig} layoutConfig
 * @returns {Box[]}
 * */
export function drawSongSectionLinesOnlyChords(
  pointer,
  songLines,
  title,
  layoutConfig
) {
  /** @type {Box} */
  const chords = decorateAsBox(drawOnlyChords)(
    { songLines, title },
    layoutConfig,
    MutableFreePointer.fromPoint(pointer)
  );
  chords.setPosition({
    pointOnRect: { x: "left", y: "top" },
    pointOnGrid: MutableFreePointer.fromPoint(pointer),
  });

  const lowerEndOfSection = MutableFreePointer.fromPoint(
    pointer.clone().moveToBorder("bottom")
  );
  const sectionWillExeedPage = chords.rectangle
    .getPointAt({ x: "left", y: "bottom" })
    .isLowerThan(lowerEndOfSection);
  if (sectionWillExeedPage) {
    const leftTopCorner = pointer
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
    pointer = MutableBoxPointer.atBox("left", "top", lyricBox);
  }
  chords.setPosition({
    pointOnRect: { x: "left", y: "top" },
    pointOnGrid: MutableFreePointer.fromPoint(pointer),
  });
  pointer.box.appendChild(chords);
  return [chords];
}

/**
 * @param {{songLines:SongLine[]; title:string}} content
 * @param {LayoutConfig} layoutConfig
 * @param {MutableFreePointer} pointer
 * @returns
 */
function drawOnlyChords({ songLines, title }, layoutConfig, pointer) {
  const chordTextConfig = layoutConfig.chordTextConfig;
  const chordLineHeight = chordTextConfig.lineHeight;

  const lines = [];
  for (const line of songLines) {
    const text = title + line.chords.map((c) => c.chord).join(" ");
    const textBox = new TextBox(text, layoutConfig.chordTextConfig);
    textBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: MutableFreePointer.fromPoint(pointer),
    });
    pointer.moveDown(chordLineHeight);
    lines.push(textBox);
  }
  return lines;
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
