/**
 * @typedef {import("../Length.js").Length} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("pdf-lib").Color}  Color
 * @typedef {import("./BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 * @typedef {import("./Geometry.js").HOBox} HOBox
 * @typedef {import("./Geometry.js").Printable} Printable
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
 * @param {BoxTreeNode} box
 * */
export function drawDebugBox(pdfPage, box) {
  if (Document.debug) {
    const borderColor = debugLevelColorMap.get(box.level()) || rgb(1, 0, 0);
    const args = {
      x: box.leftBottomCorner.x.in("pt"),
      y: box.leftBottomCorner.y.in("pt"),
      width: box.width.in("pt"),
      height: box.height.in("pt"),
      opacity: 1,
      borderWidth: 1,
      borderColor,
    };
    pdfPage.drawRectangle(args);
  }
}

/**
 * @param {PDFPage} page
 * @param {Printable | HOBox} box
 */
export function drawToPdfPage(page, box) {
  if ("drawToPdfPage" in box) {
    return box.drawToPdfPage(page);
  }
  for (const child of box.children) {
    drawToPdfPage(page, child);
  }
}
