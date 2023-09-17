// import { LEN, Length } from "../../Length.js";
// import { SongLine } from "../../Song.js";
// /**
//  * @typedef {import("../TextConfig.js").TextConfig} TextConfig
//  * @typedef {import("pdf-lib").PDFPage} PDFPage
//  * @typedef {import("./Geometry.js").Point} Point
//  * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
//  * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
//  * @typedef {import("./Geometry.js").Dimensions} Dimensions
//  * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
//  */

// /**
//  * @typedef {object} SongLineBoxArgs
//  * @property {SongLine} line
//  * @property {TextConfig} lyricConfig
//  * @property {TextConfig} chordsConfig
//  */

// /**
//  * @implements {DetachedBox}
//  */
// export class SongLineBox {
//   /**@type {SongLine}*/
//   line;
//   /**@type {TextConfig}*/
//   lyricConfig;
//   /**@type {TextConfig}*/
//   chordsConfig;

//   /**
//    * @param {SongLineBoxArgs} args
//    */
//   constructor(args) {
//     this.line = args.line;
//     this.lyricConfig = args.lyricConfig;
//     this.chordsConfig = args.chordsConfig;
//   }

//   get width() {}

//   get height() {
//     const chordsLineHeight = this.chordsConfig.lineHeight;
//     const lyricLineHeight = this.lyricLineHeight();
//     return chordsLineHeight.add(lyricLineHeight);
//   }

//   lyricLineHeight() {
//     return this.lyricConfig.lineHeight.mul(0.75);
//   }

//   /**
//    * @param {PDFPage} pdfPage
//    * @param {import("./Geometry.js").BoxCoordinates} coordinates
//    */
//   drawToPdfPage(pdfPage, coordinates) {
//     const leftBottomCornerChordsLine = coordinates.getCoordinates("left", "bottom");

//     const leftBottomCornerLyricLine = coordinates.getCoordinates("left", "bottom");
//     const partialWidths = this.partialWidths();
//     for (const chord of this.line.chords) {
//       const yOffset = partialWidths[chord.startIndex];
//       if (!yOffset) continue;
//       pointer
//         .pointerRight(yOffset)
//         .setText("right", "bottom", chord.chord, layoutConfig.chordTextConfig);
//     }

//     pdfPage.drawText({

//     });

//     pointer.moveDown(this.chordsConfig.lineHeight);

//     pointer.moveDown(this.lyricLineHeight());
//   }

//   /**
//    * @private
//    * @returns {Array<Length>}
//    */
//   partialWidths() {
//     const result = [];
//     let partial = "";
//     for (const char of this.line) {
//       const widthPt = this.lyricConfig.font.widthOfTextAtSize(
//         partial,
//         this.lyricConfig.fontSize.in("pt")
//       );
//       result.push(LEN(widthPt, "pt"));
//       partial += char;
//     }
//     return result;
//   }
// }