/**
 * @typedef {import("./Lenght").Lenght} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 */

import { LEN } from "./Lenght.js";

export class Page {
  /** @type {PDFPage} */
  page;
  /** @type {Lenght}*/
  width;
  /** @type {Lenght}*/
  height;

  /**
   * @param {PDFPage} page
   */
  constructor(page) {
    const { width, height } = page.getSize();
    this.width = LEN(width, "pt");
    this.height = LEN(height, "pt");
    this.page = page;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getPointerAt(x, y) {
    return PagePointer.atPage(x, y, this);
  }
}

class PagePointer {
  /** @type {Lenght}*/
  x;
  /** @type {Lenght}*/
  y;
  /** @type {Page} */
  page;

  debug = false;
  log(...args) {
    if (this.debug) {
      console.log(...args);
    }
  }

  /**
   *
   * @param {Lenght} x
   * @param {Lenght} y
   * @param {Page} page
   * @private
   */
  constructor(x, y, page) {
    this.x = x;
    this.y = y;
    this.page = page;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {Page} page
   */
  static atPage(x, y, page) {
    return new PagePointer(
      PagePointer.xPositionOnPage(x, page.width),
      PagePointer.yPositionOnPage(y, page.height),
      page
    );
  }

  /**
   * @param {XStartPosition} x
   * @param {Lenght} width
   * @private
   */
  static xPositionOnPage(x, width) {
    if (x === "left") return LEN(0, "pt");
    if (x === "center") return width.mul(1 / 2);
    if (x === "right") return width;
    throw Error("Invalid x start position.");
  }

  /**
   * @param {YStartPosition} y
   * @param {Lenght} height
   * @private
   */
  static yPositionOnPage(y, height) {
    if (y === "top") return height;
    if (y === "center") return height.mul(1 / 2);
    if (y === "bottom") return LEN(0, "pt");
    throw Error("Invalid y start position.");
  }

  /**
   * @param {XStartPosition} x
   * @param {Lenght} width
   * @private
   */
  xPositionRelativeToThis(x, width) {
    if (x === "left") return this.x.sub(width);
    if (x === "center") return this.x.sub(width.mul(1 / 2));
    if (x === "right") return this.x;
    throw Error("Invalid x start position.");
  }

  /**
   * @param {YStartPosition} y
   * @param {Lenght} height
   * @private
   */
  yPositionRelativeToThis(y, height) {
    if (y === "top") return this.y;
    if (y === "center") return this.y.sub(height.mul(1 / 2));
    if (y === "bottom") return this.y.sub(height);
    throw Error("Invalid y start position.");
  }

  clone() {
    return new PagePointer(this.x, this.y, this.page);
  }

  /**
   * @param {Lenght} offset
   */
  moveRight(offset) {
    this.x = this.x.add(offset);
    return this;
  }

  /**
   * @param {Lenght} offset
   */
  moveLeft(offset) {
    this.x = this.x.sub(offset);
    return this;
  }

  /**
   * @param {Lenght} offset
   */
  moveUp(offset) {
    this.y = this.y.add(offset);
    return this;
  }

  /**
   * @param {Lenght} offset
   */
  moveDown(offset) {
    this.y = this.y.sub(offset);
    return this;
  }

  /**
   * @param {Lenght} offset
   */
  pointerRight(offset) {
    return this.clone().moveRight(offset);
  }

  /**
   * @param {Lenght} offset
   */
  pointerLeft(offset) {
    return this.clone().moveLeft(offset);
  }

  /**
   * @param {Lenght} offset
   */
  pointerUp(offset) {
    return this.clone().moveUp(offset);
  }

  /**
   * @param {Lenght} offset
   */
  pointerDown(offset) {
    return this.clone().moveDown(offset);
  }

  /**
   *
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @param {string} text
   * @param {Lenght} fontSize
   * @param {PDFFont} font
   */
  drawText(x, y, text, fontSize, font) {
    const height = LEN(font.heightAtSize(fontSize.in("pt")), "pt");
    const width = LEN(font.widthOfTextAtSize(text, fontSize.in("pt")), "pt");
    const drawArgs = {
      x: this.xPositionRelativeToThis(x, width).in("pt"),
      y: this.yPositionRelativeToThis(y, height).in("pt"),
      font: font,
      size: fontSize.in("pt"),
    };
    this.log({ x: drawArgs.x, y: drawArgs.y, text }, "\n");
    this.page.page.drawText(text, drawArgs);
  }

  /**
   * @param {XStartPosition}
   * @private
   */
}

class Box {
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;
  /**
   * @param {Dimesions} dims
   */
  constructor(dims) {
    (this.width = dims.width), (this.height = dims.height);
  }
}

/** @typedef {"center" | "left" | "right"} XStartPosition */
/** @typedef {"center" | "bottom" | "top"} YStartPosition */

/** @typedef {"left" | "right" | "bottom" | "top"} Direction */

/**
 * @typedef {object} Dimesions
 * @param {Lenght} width
 * @param {Lenght} height
 */

/**
 * @typedef {object} Point
 * @param {Lenght} x
 * @param {Lenght} y
 */
