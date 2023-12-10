import { WellKnownSectionType } from "../Song/SongChecker.js";
import { PointImpl } from "../Drawing/Figures/PointImpl.js";
import { TextBox } from "../Drawing/Boxes/TextBox.js";
import { SongLineBox } from "./SongLineBox.js";
import { textConfigForSectionType } from "./TextConfigForSectionType.js";
import { LEN } from "../Shared/Length.js";
import { chordBox } from "./ChordBox.js";
import { ArragmentBox } from "../Drawing/Boxes/ArrangementBox.js";

/**
 * @typedef {import("../Drawing/Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Drawing/Geometry.js").Point} Point
 * @typedef {import("../Song/Song.js").SongSection} SongSection
 * @typedef {import("../Drawing/Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Drawing/Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Drawing/Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("../Drawing/Geometry.js").Rectangle} Rectangle
 */

/**
 * @typedef {object} SongSectionBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 */

/**
 * @param {SongSection} section
 * @param {LayoutConfig} layoutConfig
 * @param {PointImpl} startPoint
 */
function drawsongSection(section, layoutConfig, startPoint) {
  const sectionType = section.type;
  const config = textConfigForSectionType(sectionType, layoutConfig);
  const children = section.lines.map((l) => new SongLineBox(l, config));
  for (const l of children) {
    l.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: startPoint,
    });
    startPoint.moveDown(l.rectangle.height);
  }
  return children;
}

/**
 * @param {SongSection} section
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle=} rect
 * @returns
 */
export function songSection(section, layoutConfig, rect) {
  const onlyChordsSections = [
    WellKnownSectionType.Intro,
    WellKnownSectionType.Outro,
    WellKnownSectionType.Interlude,
  ];
  const children = onlyChordsSections.includes(section.type)
    ? drawOnlyChords(section, layoutConfig, PointImpl.origin())
    : drawsongSection(section, layoutConfig, PointImpl.origin());

  const sectionBox = ArragmentBox.undboundBoxGroup(children);
  if (rect) {
    sectionBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: rect.getPoint("left", "top"),
    });
  }
  return sectionBox;
}

/**
 * @param {SongSection} section
 * @param {LayoutConfig} layoutConfig
 * @param {PointImpl} pointer
 * @returns
 */
function drawOnlyChords(section, layoutConfig, pointer) {
  const title = section.type + "   ";
  const songLines = section.lines;
  const chordTextConfig = layoutConfig.chordTextConfig;
  const chordLineHeight = chordTextConfig.lineHeight;

  const result = [];
  for (const line of songLines) {
    const titleBox = new TextBox(title, layoutConfig.chordTextConfig);
    titleBox.setPosition({
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: pointer.clone(),
    });
    const chordBoxes = line.chords.map((c) =>
      chordBox(c, {
        text: layoutConfig.chordTextConfig,
        unify: layoutConfig.unifyChords,
      })
    );
    let chordPointerLeftBottom = pointer
      .clone()
      .moveRight(titleBox.rectangle.width.add(LEN(1, "mm")));
    for (const cBox of chordBoxes) {
      cBox.setPosition({
        pointOnRect: { x: "left", y: "top" },
        pointOnGrid: chordPointerLeftBottom,
      });
      chordPointerLeftBottom = chordPointerLeftBottom.moveRight(
        cBox.rectangle.width.add(LEN(1, "mm"))
      );
    }
    pointer.moveDown(chordLineHeight);
    result.push(titleBox, ...chordBoxes);
  }
  return result;
}
