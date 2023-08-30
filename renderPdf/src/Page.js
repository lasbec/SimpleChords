/**
 * @typedef {import("././Length.js").Length} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("pdf-lib").Color}  Color
 */
import { LEN } from "./Length.js";
import { BoxPointer } from "./BoxPointer.js";
import { PDFDocument, rgb } from "pdf-lib";

/** @type {Map<number, Color>} */
const debugLevelColorMap = new Map([
  [0, rgb(0.8, 0.2, 0)],
  [1, rgb(0.2, 0.9, 0.1)],
  [2, rgb(0.9, 0.5, 0.1)],
  [3, rgb(0.5, 0.5, 0.5)],
]);
/**
 * @param {PDFPage} pdfPage
 * @param {IBox} box
 * */
function drawDebugBox(pdfPage, box) {
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

export class Document {
  static debug = false;

  /**
   * @private
   * @readonly
   * @type {Page[]}
   */
  pages;

  /**
   * @type {Dimesions}
   * @readonly
   */
  defaultPageDims;

  /** @param {Dimesions} defaultPageDims */
  constructor(defaultPageDims) {
    this.defaultPageDims = defaultPageDims;
    this.pages = [];
  }

  appendNewPage() {
    const result = new Page(this.defaultPageDims, this);
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

/**
 * @typedef {object} PageLinking
 * @property {Page | null} previous
 * @property {Page | null} next
 */

export class Page {
  /** @type {Lenght}*/
  width;
  /** @type {Lenght}*/
  height;

  /** @type {Point} */
  leftBottomCorner;

  /**
   * @type {Page}
   */
  parent;

  /** @type {IBox[]} */
  children;

  /**
   * @type {Document}
   * @readonly
   */
  doc;

  /**
   * @param {Dimesions} dims
   * @param {Document} doc
   */
  constructor(dims, doc) {
    this.doc = doc;
    this.children = [];
    this.width = dims.width;
    this.height = dims.height;
    this.leftBottomCorner = {
      x: LEN(0, "pt"),
      y: LEN(0, "pt"),
    };
    this.parent = this;
  }

  /** @returns {Page} */
  appendNewPage() {
    return this.doc.appendNewPage();
  }

  level() {
    return 0;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @returns {Page}
   */
  rootPage() {
    return this;
  }

  /** @param {IBox} box  */
  setBox(box) {
    this.children.push(box);
  }

  /** @param {PDFPage} pdfPage */
  drawToPdfPage(pdfPage) {
    for (const child of this.children) {
      child.drawToPdfPage(pdfPage);
    }
  }
}

export class Box {
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;

  /** @type {Point} */
  leftBottomCorner;
  /** @type {IBox} */
  parent;

  /**
   * @param {Point} leftBottomCorner
   * @param {Dimesions} dims
   * @param {IBox} parent
   */
  constructor(leftBottomCorner, dims, parent) {
    this.width = dims.width;
    this.height = dims.height;
    this.leftBottomCorner = leftBottomCorner;
    this.parent = parent;
  }

  /** @returns {number} */
  level() {
    return 1 + this.parent.level();
  }

  /**
   * @returns {Page}
   */
  rootPage() {
    return this.parent.rootPage();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**@param {PDFPage} pdfPage */
  drawToPdfPage(pdfPage) {
    drawDebugBox(pdfPage, this);
  }
}

export class DebugBox {
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;

  get leftBottomCorner() {
    return {
      x: this.center.x.sub(this.width.mul(1 / 2)),
      y: this.center.y.sub(this.width.mul(1 / 2)),
    };
  }
  /** @type {IBox} */
  parent;

  /** @type {number} */
  constructCount;

  static constructionCounter = 0;

  /**
   * @param {Point} center
   * @param {IBox} parent
   */
  constructor(center, parent) {
    this.width = LEN(3, "mm");
    this.height = LEN(3, "mm");
    this.center = center;
    this.parent = parent;
    this.constructCount = DebugBox.constructionCounter;
    DebugBox.constructionCounter += 1;
  }

  /** @returns {number} */
  level() {
    return 1 + this.parent.level();
  }

  /**
   * @returns {Page}
   */
  rootPage() {
    return this.parent.rootPage();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**@param {PDFPage} pdfPage */
  drawToPdfPage(pdfPage) {
    pdfPage.drawCircle({
      x: this.center.x.in("pt"),
      y: this.center.y.in("pt"),
      size: 5,
      borderColor: rgb(1, 0, 0),
      borderWidth: 1,
      opacity: 1,
    });
    pdfPage.drawText(`${this.constructCount}`, {
      x: this.leftBottomCorner.x.in("pt"),
      y: this.leftBottomCorner.y.in("pt"),
      size: 6,
    });
    pdfPage.drawLine({
      start: {
        x: this.center.x.sub(this.width).in("pt"),
        y: this.center.y.in("pt"),
      },
      end: {
        x: this.center.x.add(this.width).in("pt"),
        y: this.center.y.in("pt"),
      },
      thickness: 0.1,
    });
    pdfPage.drawLine({
      start: {
        x: this.center.x.in("pt"),
        y: this.center.y.sub(this.height).in("pt"),
      },
      end: {
        x: this.center.x.in("pt"),
        y: this.center.y.add(this.height).in("pt"),
      },
      thickness: 0.1,
    });
  }
}

export class DetachedTextBox {
  /**@type {string}*/
  text;
  /**@type {TextStyle}*/
  style;
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;

  /**
   * @param {string} text
   * @param {TextStyle} style
   */
  constructor(text, style) {
    this.text = text;
    this.style = style;
    this.width = LEN(
      style.font.widthOfTextAtSize(text, style.fontSize.in("pt")),
      "pt"
    );
    this.height = LEN(style.font.heightAtSize(style.fontSize.in("pt")), "pt");
  }

  partialWidths() {
    const result = [];
    let partial = "";
    for (const char of this.text) {
      const widthPt = this.style.font.widthOfTextAtSize(
        partial,
        this.style.fontSize.in("pt")
      );
      result.push(LEN(widthPt, "pt"));
      partial += char;
    }
    return result;
  }
}

export class TextBox {
  /**@type {string}*/
  text;
  /**@type {TextStyle}*/
  style;
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;
  /** @type {Point} */
  leftBottomCorner;
  /** @type {IBox} */
  parent;

  /**
   * @param {Point} leftBottomCorner
   * @param {string} text
   * @param {TextStyle} style
   * @param {IBox} parent
   */
  constructor(leftBottomCorner, text, style, parent) {
    this.text = text;
    this.style = style;
    this.width = LEN(
      style.font.widthOfTextAtSize(text, style.fontSize.in("pt")),
      "pt"
    );
    this.height = LEN(style.font.heightAtSize(style.fontSize.in("pt")), "pt");
    this.leftBottomCorner = leftBottomCorner;
    this.parent = parent;
  }

  /** @returns {number} */
  level() {
    return 1 + this.parent.level();
  }

  /**
   * @returns {Page}
   */
  rootPage() {
    return this.parent.rootPage();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**@param {PDFPage} pdfPage*/
  drawToPdfPage(pdfPage) {
    drawDebugBox(pdfPage, this);
    pdfPage.drawText(this.text, {
      x: this.leftBottomCorner.x.in("pt"),
      y: this.leftBottomCorner.y.in("pt"),
      font: this.style.font,
      size: this.style.fontSize.in("pt"),
    });
  }
}

/** @typedef {"center" | "left" | "right"} XStartPosition */
/** @typedef {"center" | "bottom" | "top"} YStartPosition */

/** @typedef {"left" | "right" | "bottom" | "top"} Direction */

/**
 * @typedef {object} Dimesions
 * @property {Lenght} width
 * @property {Lenght} height
 */

/**
 * @typedef {object} Point
 * @property {Lenght} x
 * @property {Lenght} y
 */

/**
 * @typedef {Box | Page | TextBox} IBox
 */

/**
 * @typedef {object} TextStyle
 * @property {PDFFont} font
 * @property {Lenght} fontSize
 */
