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
    this.children = song.sections.map(
      (l) => new SongSectionBox(l, this.config)
    );
    this.width = Length.max(this.children.map((l) => l.width)) || Length.zero;

    let height = Length.zero;
    for (const s of this.children) {
      height = height.add(s.height).add(this.config.sectionDistance);
    }

    this.height = height;
  }
  /**
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {
    const pointer = position.getPointerAt("left", "top");
    for (const l of this.children) {
      const rightBottom = pointer.pointerDown(l.height).pointerRight(l.width);
      l.setPosition(pointer.span(rightBottom));
      pointer.moveDown(l.height);
    }
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    for (const child of this.children) {
      child.drawToPdfPage(pdfPage);
    }
  }
}
