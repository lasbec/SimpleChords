import { songSection } from "./SongSectionBox.js";
import { TextBox } from "../Drawing/Boxes/TextBox.js";
import { Song } from "../Song/Song.js";
import { ArragmentBox } from "../Drawing/Boxes/ArrangementBox.js";
import { SongLine } from "../Song/SongLine.js";
import { SimpleBoxGen } from "../Drawing/RectangleGens/SimpleBoxGen.js";
import { stackLayout } from "../Drawing/CollectionComponents/stackLayout.js";
import { stackBoxes } from "../Drawing/CollectionComponents/stackBoxes.js";
import { BreakableText } from "../Drawing/BreakableText.js";
import { SongLineBox } from "./SongLineBox.js";
import { BoundsImpl } from "../Drawing/Figures/BoundsImpl.js";

/**
 * @typedef {import("../Drawing/Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("../Drawing/Geometry.js").RectangleGenerator} BoxGen
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
    if (simpleResult.every((b) => !b.hasOverflow())) {
      console.log("Simples Layout gewählt");
      return simpleResult;
    }
    console.log("Kompaktes Layout gewählt");
    return songLayoutDense(song, layoutConfig, rect);
  }
  const doubleLineResult = songLayoutDoubleLine(song, layoutConfig, rect);
  if (doubleLineResult.length < simpleResult.length) {
    if (doubleLineResult.every((b) => !b.hasOverflow())) {
      console.log("Doppelzeilen Layout gewählt");
      return doubleLineResult;
    }
  }
  console.log("Kein Passendes layout gefunden");
  return simpleResult;
}
/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayoutSimple(song, layoutConfig, rect) {
  const fstPage = ArragmentBox.fromRect(rect);
  const titleBox = new TextBox(song.heading, layoutConfig.titleTextConfig);
  titleBox.setPosition({
    pointOnRect: { x: "center", y: "top" },
    pointOnGrid: rect.getPointAt({ x: "center", y: "top" }),
  });
  fstPage.appendChild(titleBox);

  const begin = fstPage.rectangle
    .getPoint("left", "top")
    .moveDown(titleBox.rectangle.height)
    .moveDown(titleBox.rectangle.height);

  const sectionContainers = stackLayout(
    song.sections,
    {
      layout: songSection,
      sectionDistance: layoutConfig.sectionDistance,
      style: layoutConfig,
    },
    new SimpleBoxGen(rect, begin)
  );
  if (sectionContainers[0]) {
    fstPage.appendChild(sectionContainers[0]);
  }

  return [fstPage, ...sectionContainers.slice(1)];
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
  const titleBox = new TextBox(song.heading, layoutConfig.titleTextConfig);
  titleBox.setPosition({
    pointOnRect: { x: "center", y: "top" },
    pointOnGrid: rect.getPointAt({ x: "center", y: "top" }),
  });

  const workload = song.sections.map((s) => {
    const bounds = BoundsImpl.from({
      maxLeft: rect.getBorderVertical("left"),
      minLeft: rect.getBorderVertical("left"),
      maxRight: rect.getBorderVertical("right"),
      minRight: rect.getBorderVertical("right"),
    });
    const box = new ArragmentBox([], bounds);
    return {
      section: s,
      result: box,
    };
  });
  /** @type {Map<string, {section: SongSection, result: ArragmentBox}[]>} */
  const sectionsByType = new Map();
  for (const pair of workload) {
    const arr = sectionsByType.get(pair.section.type) || [];
    if (arr.length === 0) {
      sectionsByType.set(pair.section.type, arr);
    }
    arr.push(pair);
  }

  const style = {
    chordsConfig: layoutConfig.chordTextConfig,
    lyricConfig: layoutConfig.lyricTextConfig,
  };

  for (const sectionGroup of sectionsByType.values()) {
        renderSongSectionsDense(sectionGroup, style);
  }
  const sectionBoxes = workload.map((pair) => pair.result);
  return stackBoxes(
    [
      {
        content: titleBox,
        style: {
          alignment: "center",
          sectionDistance: titleBox.rectangle.height,
        },
      },
      ...sectionBoxes,
    ],
    {
      sectionDistance: layoutConfig.sectionDistance,
      alignment: "left",
    },
    new SimpleBoxGen(rect)
  );
}

/**
 * @typedef {import("./SongSectionBox.js").SongSection} SongSection
 */

/**
 * @param {{section:SongSection, result:ArragmentBox}[]} songSections
 * @param {import("./SongLineBox.js").SongLineBoxConfig}style
 * @returns {void}
 */
function renderSongSectionsDense(songSections, style) {
  /** @type {{rest:BreakableText<SongLineBox>; result:ArragmentBox}[]} */
  const workingLines = songSections.map((s) => {
    /** @type {SongLineBox[]} */
    const boxes = s.section.lines.map((l) => new SongLineBox(l, style));
    return {
      rest: BreakableText.fromPrefferdLineUp(SongLineBox, boxes),
      result: s.result,
    };
  });

  while (workingLines.some((l) => l.rest.lenght > 0)) {
    const max = Math.min(...workingLines.map(maxChordsToFit));
    for (const line of workingLines) {
      if (line.rest.lenght === 0) continue;
      const indexOfLastFittingChord =
        line.rest.text.content.chords[max - 1]?.startIndex ?? 0;
      const indexOfFirstOverflowingChord =
        line.rest.text.content.chords[max]?.startIndex;
      const maxCharsToFit = line.rest.text.maxCharsToFit(
        line.result.rectangle.width
      );
      const [newLine, rest] = line.rest.break({
        minLineLen: indexOfLastFittingChord + 1,
        maxLineLen: Math.min(
          maxCharsToFit,
          indexOfFirstOverflowingChord || Number.POSITIVE_INFINITY
        ),
      });
      newLine.setPosition({
        pointOnGrid: line.result.rectangle.getPoint("left", "bottom"),
        pointOnRect: { x: "left", y: "top" },
      });
      line.result.appendChild(newLine);
      line.rest = rest;
    }
  }

  /**
   * @param {{rest:BreakableText<SongLineBox>; result:ArragmentBox}} line
   * @returns {number}
   */
  function maxChordsToFit(line) {
    const maxWidth = line.result.rectangle.width;
    return line.rest.text.maxChordsToFitInWidth(maxWidth);
  }
}
