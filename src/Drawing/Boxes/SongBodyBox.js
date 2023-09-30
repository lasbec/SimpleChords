import { LEN, Length } from "../../Length.js";
import { SongLineBox } from "./SongLineBox.js";
import { Song } from "../../Song.js";
import { SongSectionBox } from "./SongSectionBox.js";
/**
 * @typedef {import("../../Song.js").SongSection} SongSection
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").DetachedBox} DetachedBox
 */

/**
 * @typedef {object} SongBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 *
 * @property {Length} sectionDistance
 */

/**
 * @implements {DetachedBox}
 */
export class SongBodyBox {
  /**@type {Song}*/
  song;
  /**@type {SongBoxConfig}*/
  config;
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  /**
   * @param {Song} song
   * @param {SongBoxConfig} config
   */
  constructor(song, config) {
    this.song = song;
    this.config = config;
    this.sections = song.sections.map(
      (l) => new SongSectionBox(l, this.config)
    );
    this.width = Length.max(this.sections.map((l) => l.width)) || Length.zero;

    let height = Length.zero;
    for (const s of this.sections) {
      height = height.add(s.height).add(this.config.sectionDistance);
    }

    this.height = height;
    this.leftTopPointer = null;
  }
  /**
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {
    this.leftTopPointer = position.getPointerAt("left", "top");
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const pointer = this.leftTopPointer;
    if (!pointer) {
      throw Error("Position not set.");
    }
    for (const l of this.sections) {
      const rightBottom = pointer.pointerDown(l.height).pointerRight(l.width);
      l.setPosition(pointer.span(rightBottom));
      pointer.moveDown(l.height);
    }
  }
}
