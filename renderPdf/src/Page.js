/**
 * @typedef {import("./Lenght").Lenght} Lenght
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 */
import { LEN } from "./Lenght.js";
import { BoxPointer } from "./BoxPointer.js";

export class Page {
  /** @type {PDFPage} */
  page;
  /** @type {Lenght}*/
  width;
  /** @type {Lenght}*/
  height;

  /** @type {Point} */
  _leftBottomCorner;

  /** @type {Page}*/
  parent;

  /**
   * @param {PDFPage} page
   */
  constructor(page) {
    const { width, height } = page.getSize();
    this.width = LEN(width, "pt");
    this.height = LEN(height, "pt");
    this.page = page;
    this._leftBottomCorner = {
      x: LEN(0, "pt"),
      y: LEN(0, "pt"),
    };
    this.parent = this;
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
}

export class Box {
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;

  /** @type {Point} */
  _leftBottomCorner;
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
    this._leftBottomCorner = leftBottomCorner;
    this.parent = parent;
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

  assertIsInsideParent() {
    const pointer_left_top = this.getPointerAt("left", "top").onParent();
    console.log("pointer_left_top");
    if (pointer_left_top.isOutsideOfBox()) {
      throw new Error("Overflow on parent box left_top");
    }
    const pointer_left_bottom = this.getPointerAt("left", "bottom").onParent();
    console.log("pointer_left_bottom");
    if (pointer_left_bottom.isOutsideOfBox()) {
      throw new Error("Overflow on parent box left_bottom");
    }
    const pointer_right_top = this.getPointerAt("right", "top").onParent();
    console.log("pointer_right_top");
    if (pointer_right_top.isOutsideOfBox()) {
      throw new Error("Overflow on parent box right_top");
    }
    const pointer_right_bottom = this.getPointerAt(
      "right",
      "bottom"
    ).onParent();
    console.log("pointer_right_bottom");
    if (pointer_right_bottom.isOutsideOfBox()) {
      throw new Error("Overflow on parent box right_bottom");
    }
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
  /**@type {Lenght}*/
  width;
  /**@type {Lenght}*/
  height;
  /** @type {Point} */
  _leftBottomCorner;
  /** @type {IBox} */
  parent;

  /**
   * @param {Point} leftBottomCorner
   * @param {string} text
   * @param {TextStyle} style
   * @param {IBox} parent
   */
  constructor(leftBottomCorner, text, style, parent) {
    this.width = LEN(
      style.font.widthOfTextAtSize(text, style.fontSize.in("pt")),
      "pt"
    );
    this.height = LEN(style.font.heightAtSize(style.fontSize.in("pt")), "pt");
    this._leftBottomCorner = leftBottomCorner;
    this.parent = parent;
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
