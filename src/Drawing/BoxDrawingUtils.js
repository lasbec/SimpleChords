/**
 * @typedef {import("../Shared/Length.js").Length} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("pdf-lib").Color}  Color
 * @typedef {import("./Geometry.js").Box} Box
 */
import { rgb } from "pdf-lib";
import { Document } from "./Document.js";

/** @type {Map<number, Color>} */
const debugLevelColorMap = new Map([
  [0, rgb(0.8, 0.2, 0)],
  [1, rgb(0.2, 0.9, 0.1)],
  [2, rgb(0.9, 0.5, 0.1)],
  [3, rgb(0.5, 0.5, 0.5)],
]);

/**
 * @param {PDFPage} pdfPage
 * @param {Box} box
 * */
export function drawDebugBox(pdfPage, box) {
  if (Document.debug) {
    const borderColor = debugLevelColorMap.get(box.level()) || rgb(1, 0, 0);
    const leftBottomCorner = box.rectangle.getPoint("left", "bottom");
    const args = {
      x: leftBottomCorner.x.in("pt"),
      y: leftBottomCorner.y.in("pt"),
      width: box.rectangle.width.in("pt"),
      height: box.rectangle.height.in("pt"),
      opacity: 1,
      borderWidth: 1,
      borderColor,
    };
    pdfPage.drawRectangle(args);
  }
}
