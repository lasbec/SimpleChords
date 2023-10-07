import { BoxPointer } from "../BoxPointer.js";
import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../PrimitiveBoxes/TextBox.js";
import { TextConfig } from "../TextConfig.js";
import { Length } from "../../Length.js";
import { Song } from "../../Song.js";
import { WellKnownSectionType } from "../../SongChecker.js";
import { SongLine } from "../../SongLine.js";

/**
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../../SchemaWrapper.js").LayoutConfig} LayoutConfig
 */

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {BoxPointer} _pointer
 * @returns {Box[]}
 */
export function layOutSongOnNewPage(song, layoutConfig, _pointer) {
  const lyricLineHeight = layoutConfig.lyricTextConfig.lineHeight;
  const titleBox = drawTitle(
    song,
    _pointer,
    layoutConfig.topMargin,
    layoutConfig.titleTextConfig
  );
  const pointer = BoxPointer.atBox("left", "bottom", titleBox).onPage();

  pointer.moveDown(lyricLineHeight);
  pointer.moveToBorder("left").moveRight(layoutConfig.leftMargin);

  const rightBottomPointer = pointer
    .onPage()
    .moveToBorder("bottom")
    .moveToBorder("right")
    .moveUp(layoutConfig.bottomMargin)
    .moveLeft(layoutConfig.rightMargin);
  const lyricBox = pointer.span(rightBottomPointer);
  let lyricPointer = BoxPointer.atBox("left", "top", lyricBox);

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
      lyricPointer = BoxPointer.fromPoint(
        lastLine?.getPoint("left", "bottom"),
        lyricBox
      );
    }
    lyricPointer.moveDown(layoutConfig.sectionDistance);
  }
  return result;
}

/**
 * @param {BoxPointer} pointer
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

  const heightOfSection = sectionBox.height;

  const lowerEndOfSection = pointer.clone().moveToBorder("bottom");

  const sectionWillExeedPage = pointer
    .pointerDown(heightOfSection)
    .isLowerThan(lowerEndOfSection);
  if (sectionWillExeedPage) {
    const leftTopCorner = pointer
      .nextPageAt("left", "top")
      .moveDown(layoutConfig.topMargin)
      .moveRight(layoutConfig.leftMargin);
    const rightBottomCorner = pointer
      .onPage()
      .moveToBorder("bottom")
      .moveToBorder("right")
      .moveUp(layoutConfig.topMargin)
      .moveLeft(layoutConfig.rightMargin);
    const lyricBox = leftTopCorner.span(rightBottomCorner);
    pointer = BoxPointer.atBox("left", "top", lyricBox);
  }
  pointer.setBox("left", "top", sectionBox);
  return [sectionBox];
}

/**
 * @param {BoxPointer} pointer
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
  const chordTextConfig = layoutConfig.chordTextConfig;
  const chordLineHeight = chordTextConfig.lineHeight;
  const heightOfSection = chordLineHeight.mul(songLines.length);

  const lowerEndOfSection = pointer.clone().moveToBorder("bottom");

  const sectionWillExeedPage = pointer
    .pointerDown(heightOfSection)
    .isLowerThan(lowerEndOfSection);
  if (sectionWillExeedPage) {
    const leftTopCorner = pointer
      .nextPageAt("left", "top")
      .moveDown(layoutConfig.topMargin)
      .moveRight(layoutConfig.leftMargin);
    const rightBottomCorner = pointer
      .onPage()
      .moveToBorder("bottom")
      .moveToBorder("right")
      .moveUp(layoutConfig.topMargin)
      .moveLeft(layoutConfig.rightMargin);
    const lyricBox = leftTopCorner.span(rightBottomCorner);
    pointer = BoxPointer.atBox("left", "top", lyricBox);
  }

  /** @type {Box[]} */
  const lines = [];
  for (const line of songLines) {
    const text = title + line.chords.map((c) => c.chord).join(" ");
    const textBox = new TextBox(text, layoutConfig.chordTextConfig);
    lines.push(textBox);
    pointer.setBox("left", "top", textBox);
    pointer.moveDown(chordLineHeight);
  }
  return lines;
}

/**
 * @param {Song} song
 * @param {BoxPointer} _pointer
 * @param {Length} topMargin
 * @param {TextConfig} style
 */
export function drawTitle(song, _pointer, topMargin, style) {
  const pointer = _pointer
    .onPage()
    .moveHorizontalCenter()
    .moveToBorder("top")
    .moveDown(topMargin);
  const x = "center";
  const y = "top";
  const text = song.heading;
  const textBox = new TextBox(text, style);
  return pointer.setBox(x, y, textBox);
}
