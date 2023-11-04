/**
 * @typedef {import("../Shared/Length.js").Length} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("pdf-lib").Color}  Color
 * @typedef {import("./Geometry.js").Box} Box
 */
import { grayscale, rgb } from "pdf-lib";
import { DebugMode } from "./DebugMode.js";

/** @type {Map<number, Color>}
 * @ts-ignore */
const debugLevelColorMap = new Map([
  [0, rgb(0.0, 0.9, 0.0)],
  [1, rgb(0.0, 0.0, 0.7)],
  [2, rgb(0.8, 0.0, 0.0)],
  [3, grayscale(0.0)],
  [4, grayscale(0.66)],
  [5, grayscale(0.33)],
]);

/**
 * @param {PDFPage} pdfPage
 * @param {Box} box
 * */
export function drawDebugBox(pdfPage, box) {
  if (DebugMode.isOn) {
    const borderColor = debugLevelColorMap.get(box.level());
    if (!borderColor) throw Error("Boxes too depp");
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
