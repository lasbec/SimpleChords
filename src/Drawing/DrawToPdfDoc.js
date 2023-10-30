import { PDFDocument } from "pdf-lib";

/**
 * @typedef {import("./Geometry.js").Box} Box
 */

/**
 * @param {PDFDocument} pdfDoc
 * @param {Box[]} pages
 * */
export function drawToPdfDoc(pdfDoc, pages) {
  for (const page of pages) {
    const pdfPage = pdfDoc.addPage([
      page.rectangle.width.in("pt"),
      page.rectangle.height.in("pt"),
    ]);
    page.drawToPdfPage(pdfPage);
  }
}
