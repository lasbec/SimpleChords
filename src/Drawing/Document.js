import { PDFDocument } from "pdf-lib";
import { PageBox as Page } from "./Boxes/PageBox.js";
import { BoxTreeRoot } from "./Boxes/BoxTreeNode.js";

/**
 * @typedef {import("./Boxes/Geometry.js").Dimensions} Dimensions
 */

export class Document {
  static debug = false;

  /**
   * @private
   * @readonly
   * @type {BoxTreeRoot[]}
   */
  pages;

  /**
   * @type {Dimensions}
   * @readonly
   */
  defaultPageDims;

  /** @param {Dimensions} defaultPageDims */
  constructor(defaultPageDims) {
    this.defaultPageDims = defaultPageDims;
    this.pages = [];
  }

  appendNewPage() {
    const result = new BoxTreeRoot(new Page(this.defaultPageDims, this));
    this.pages.push(result);
    return result;
  }

  /**@param {PDFDocument} pdfDoc*/
  drawToPdfDoc(pdfDoc) {
    for (const page of this.pages) {
      const pdfPage = pdfDoc.addPage([
        page.width.in("pt"),
        page.height.in("pt"),
      ]);
      page.drawToPdfPage(pdfPage);
    }
  }
}
