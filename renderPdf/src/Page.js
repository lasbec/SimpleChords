/**
 * @typedef {import("./Lenght").Lenght} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("pdf-lib").Color}  Color
 */
import { LEN } from "./Lenght.js";
import { BoxPointer } from "./BoxPointer.js";
import { PDFDocument, rgb } from "pdf-lib";

const debug = true;

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
  if (debug) {
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

export class Page {
  /** @type {Lenght}*/
  width;
  /** @type {Lenght}*/
  height;

  /** @type {Point} */
  leftBottomCorner;

  /** @type {Page}*/
  parent;

  /** @type {IBox[]} */
  children;

  /** @param {Dimesions} dims */
  constructor(dims) {
    this.children = [];
    this.width = dims.width;
    this.height = dims.height;
    this.leftBottomCorner = {
      x: LEN(0, "pt"),
      y: LEN(0, "pt"),
    };
    this.parent = this;
  }

  level() {
    return 0;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
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

  /**@param {PDFDocument} pdfDoc*/
  appendToPdfDoc(pdfDoc) {
    const pdfPage = pdfDoc.addPage([this.width.in("pt"), this.height.in("pt")]);
    this.drawToPdfPage(pdfPage);
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

  /** @param {unknown[]} args  */
  log(...args) {
    if (debug) {
      console.log(...args);
    }
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

  /**
   * @param  {unknown[]} args
   */
  log(...args) {
    if (debug) {
      console.log(...args);
    }
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

  /**
   * @param  {unknown[]} args
   */
  log(...args) {
    if (debug) {
      console.log(...args);
    }
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
    this.log("Draw Text", {
      text: this.text,
      x: this.leftBottomCorner.x.in("mm"),
      y: this.leftBottomCorner.y.in("mm"),
      font: this.style.font.name,
      fontSize: this.style.fontSize.in("mm"),
    });
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
