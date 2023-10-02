import { Length } from "../../Length.js";
import { Song } from "../../Song.js";
import { getPoint } from "../BoxMeasuringUtils.js";
import { SongSectionBox } from "./SongSectionBox.js";
/**
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../../Song.js").SongSection} SongSection
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").HOBox} HOBox
 */

/**
 * @typedef {object} SongBoxConfig
 * @property {TextConfig} chordsConfig
 * @property {TextConfig} lyricConfig
 *
 * @property {Length} sectionDistance
 */

/**
 * @implements {HOBox}
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
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const pointer = getPoint({
      targetX: "left",
      targetY: "top",
      corner: position,
      width: this.width,
      height: this.height,
    });
    for (const l of this.children) {
      l.setPosition({
        x: "left",
        y: "top",
        point: pointer,
      });
      pointer.moveDown(l.height);
    }
  }
}
