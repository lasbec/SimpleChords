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
import { textConfigForSectionType } from "./TextConfigForSectionType.js";
import { sum } from "pdf-lib";

/**
 * @typedef {import("../Drawing/Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("../Drawing/Geometry.js").RectangleGenerator} BoxGen
 */

class LazyBoxes {
  /**
   * @param {()=> Box[]} valueFn
   */
  constructor(valueFn) {
    this.valueFn = valueFn;
    /** @type {Box[]} */
    this._value;
    /** @type {boolean} */
    this._isOverflowing;
  }

  value() {
    if (!this._value) {
      this._value = this.valueFn();
    }
    return this._value;
  }

  overflowing() {
    if (this._isOverflowing === undefined) {
      this._isOverflowing = this.value().some((b) => b.hasOverflow());
    }
    return this._isOverflowing;
  }

  /**
   * @param {number} limit
   * @returns {false | Box[]}
   */
  meetsPageLimit(limit) {
    if (this.overflowing()) return false;
    if (this.value().length > limit) {
      return false;
    }
    return this.value();
  }
}

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Rectangle} rect
 * @returns {Box[]}
 */
export function songLayout(song, layoutConfig, rect) {
  const simpleResult = new LazyBoxes(() =>
    songLayoutSimple(song, layoutConfig, rect)
  );

  const doubleLineResult = new LazyBoxes(() =>
    songLayoutDoubleLine(song, layoutConfig, rect)
  );

  const niceBrokenResult = new LazyBoxes(() =>
    songLayoutAdjustable(song, layoutConfig, rect, renderSongSectionBreakNicely)
  );

  const denseResult = new LazyBoxes(() =>
    songLayoutAdjustable(song, layoutConfig, rect, renderSongSectionsDense)
  );

  let count = 0;
  while (count <= 3) {
    count += 1;
    const simple = simpleResult.meetsPageLimit(count);
    if (simple) {
      console.error("simple layout chosen.");
      return simple;
    }

    const double = doubleLineResult.meetsPageLimit(count);
    if (double) {
      console.error("double layout chosen.");
      return double;
    }

    const nice = niceBrokenResult.meetsPageLimit(count);
    if (nice) {
      console.error("nice layout chosen.");
      return nice;
    }

    const dense = denseResult.meetsPageLimit(count);
    if (dense) {
      console.error("dense layout chosen.");
      return dense;
    }
  }
  console.error("give up: nice layout chosen.");
  return niceBrokenResult.value();
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
 * @param {( songSections:{section:SongSection, result:ArragmentBox}[], style :SongLineBoxConfig) => void} fn
 * @returns {Box[]}
 */
export function songLayoutAdjustable(song, layoutConfig, rect, fn) {
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

  for (const sectionGroup of sectionsByType.values()) {
    const style = textConfigForSectionType(
      sectionGroup[0]?.section.type || "verse",
      layoutConfig
    );
    fn(sectionGroup, style);
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
 * @typedef {{rest: BreakableText<SongLineBox>;result: ArragmentBox;}} WorkingLine
 * @typedef {import("./SongSectionBox.js").SongSection} SongSection
 * @typedef {import("./SongLineBox.js").SongLineBoxConfig} SongLineBoxConfig
 */

/**
 * @param {{rest:BreakableText<SongLineBox>; result:ArragmentBox}} line
 * @returns {number}
 */
function maxChordsToFit(line) {
  const maxWidth = line.result.rectangle.width;
  return line.rest.text.maxChordsToFitInWidth(maxWidth);
}

/**
 * @param {{section:SongSection, result:ArragmentBox}[]} songSections
 * @param {SongLineBoxConfig}style
 * @returns {void}
 */
function renderSongSectionsDense(songSections, style) {
  /** @type {WorkingLine[]} */
  const workingLines = songSections.map((s) => {
    /** @type {SongLineBox[]} */
    const boxes = s.section.lines.map((l) => new SongLineBox(l, style));
    return {
      rest: BreakableText.fromPrefferdLineUp(SongLineBox, boxes),
      result: s.result,
    };
  });

  while (workingLines.some((l) => l.rest.lenght > 0)) {
    const maxChordsToFit = maxChordsToFitInLine(workingLines);
    for (const line of workingLines) {
      reduceLine(line, maxChordsToFit);
    }
  }
}

/**
 * @param {{section:SongSection, result:ArragmentBox}[]} songSections
 * @param {SongLineBoxConfig}style
 * @returns {void}
 */
function renderSongSectionBreakNicely(songSections, style) {
  /** @type {WorkingLine[]} */
  const workingLines = songSections.map((s) => {
    /** @type {SongLineBox[]} */
    const boxes = s.section.lines.map((l) => new SongLineBox(l, style));
    return {
      rest: BreakableText.fromPrefferdLineUp(SongLineBox, boxes),
      result: s.result,
    };
  });

  while (workingLines.some((l) => l.rest.lenght > 0)) {
    const maxChordsToFit = nicestChordIndexToBreakAfter(workingLines);
    for (const line of workingLines) {
      reduceLine(line, maxChordsToFit);
    }
  }
}

/**
 * @param {WorkingLine[]} workingLines
 * @returns {number}
 */
function nicestChordIndexToBreakAfter(workingLines) {
  const maxChords = Math.min(...workingLines.map(maxChordsToFit));
  let currResult = 0;
  let currMinBadness = Number.POSITIVE_INFINITY;
  for (let i = 1; i <= maxChords; i += 1) {
    const badnessSum = sum(
      workingLines.map((l) => {
        if (l.rest.lenght <= 1) return 1;
        const [_0, _1, badness] = breakLineBetweenChords(l, i - 1, i);
        return badness;
      })
    );
    if (badnessSum <= currMinBadness) {
      currMinBadness = badnessSum;
      currResult = i;
    }
  }
  return currResult;
}

/**
 * @param {WorkingLine[]} workingLines
 * @returns {number}
 */
function maxChordsToFitInLine(workingLines) {
  const result1 = Math.min(...workingLines.map(maxChordsToFit));
  const badnessResult1 = Math.max(
    ...workingLines.map((l) => {
      if (l.rest.lenght <= 1) return 1;
      const [_0, _1, badness] = breakLineBetweenChords(l, result1 - 1, result1);
      return badness;
    })
  );
  if (badnessResult1 < 100) return result1;

  const result2 = result1 - 1;

  const badnessResult2 = Math.max(
    ...workingLines.map((l) => {
      if (l.rest.lenght <= 1) return 1;
      const [_0, _1, badness] = breakLineBetweenChords(l, result2 - 1, result2);
      return badness;
    })
  );
  if (badnessResult2 < badnessResult1) {
    return result2;
  }
  return result1;
}

/**
 * @param {WorkingLine} line
 * @param {number} maxChords
 */
function reduceLine(line, maxChords) {
  if (line.rest.lenght === 0) return;
  if (line.rest.lenght === 1) {
    const newLine = line.rest.text;
    newLine.setPosition({
      pointOnGrid: line.result.rectangle.getPoint("left", "bottom"),
      pointOnRect: { x: "left", y: "top" },
    });
    line.result.appendChild(newLine);
    line.rest = line.rest.slice(0, 0);
    return;
  }
  const [newLine, rest, badness] = breakLineBetweenChords(
    line,
    maxChords - 1,
    maxChords
  );

  newLine.setPosition({
    pointOnGrid: line.result.rectangle.getPoint("left", "bottom"),
    pointOnRect: { x: "left", y: "top" },
  });
  line.result.appendChild(newLine);
  line.rest = rest.trim();
}

/**
 *@param {WorkingLine} line
 * @param {number} start include
 * @param {number} stop exclude
 * @returns
 */
function breakLineBetweenChords(line, start, stop) {
  const indexOfLastFittingChord =
    line.rest.text.content.chords[start]?.startIndex ?? 0;
  const indexOfFirstOverflowingChord =
    line.rest.text.content.chords[stop]?.startIndex;
  const maxCharsToFit = line.rest.text.maxCharsToFit(
    line.result.rectangle.width
  );
  const maxLineLen = Math.min(
    maxCharsToFit,
    indexOfFirstOverflowingChord || Number.POSITIVE_INFINITY
  );
    return line.rest.break({
    minLineLen: indexOfLastFittingChord + 1,
    maxLineLen: maxLineLen,
  });
}
