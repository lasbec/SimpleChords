import { PDFPage } from "pdf-lib";
import { PageBox } from "./Boxes/PageBox.js";
import { Length } from "../Length.js";
import { BoxPointer } from "./BoxPointer.js";
import { FreePointer } from "./FreePointer.js";
/**
 */

/**
 * @typedef {import("./Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").BoxPlacement} BoxPlacement
 */

/**
 * @typedef {BoxTreeChildNode | BoxTreeRoot} BoxTreeNode
 */

/** @implements {Box} */
export class BoxTreeRoot {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {PageBox} */
  ownBox;
  /** @type {BoxTreeNode} */
  parent;
  /** @type {BoxTreeNode[]} */
  children;

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.ownBox.appendNewPage();
  }

  /**
   * @param {PageBox} ownBox
   */
  constructor(ownBox) {
    this.leftBottomCorner = {
      x: Length.zero,
      y: Length.zero,
    };
    this.ownBox = ownBox;
    this.parent = this;
    this.children = [];
  }

  get width() {
    return this.ownBox.width;
  }

  get height() {
    return this.ownBox.height;
  }
  get document() {
    return this.ownBox.document;
  }

  /** @return {BoxTreeRoot} */
  get root() {
    return this;
  }

  /** @returns {PageBox} */
  get rootPage() {
    return this.ownBox;
  }

  /** @return {number} */
  level() {
    return this.ownBox.level();
  }

  /** @param {Box} box */
  setParent(box) {
    console.error(box);
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    this.ownBox.drawToPdfPage(page);
  }

  /**
   *
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getBoxPointer(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {FreePointer}
   */
  getPoint(x, y) {
    return this.ownBox.getPoint(x, y);
  }

  /** @param {BorderPosition} border  */
  getBorder(border) {
    return this.ownBox.getBorder(border);
  }

  /**
   *
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.ownBox.setPosition(position);
  }

  /** @param {Box} box */
  appendChild(box) {
    /** @ts-ignore */
    this.children.push(box);
  }
}

/**
 */

/** @implements {Box} */
export class BoxTreeChildNode {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {Box} */
  ownBox;
  /** @type {BoxTreeNode} */
  parent;
  /** @type {BoxTreeNode[]} */
  children;

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.ownBox.appendNewPage();
  }

  /**
   *
   * @param {Point} leftBottomCorner
   * @param {Box} ownBox
   * @param {BoxTreeNode} parentNode
   */
  constructor(leftBottomCorner, ownBox, parentNode) {
    this.leftBottomCorner = leftBottomCorner;
    this.ownBox = ownBox;
    this.ownBox.setPosition({
      x: "left",
      y: "bottom",
      point: FreePointer.fromPoint(leftBottomCorner),
    });
    this.ownBox.setParent(parentNode.ownBox);
    this.parent = parentNode;
    this.children = [];
  }

  /** @param {Box} box */
  appendChild(box) {
    /** @ts-ignore */
    this.children.push(box);
  }

  get width() {
    return this.ownBox.width;
  }

  get height() {
    return this.ownBox.height;
  }

  get document() {
    return this.ownBox.document;
  }

  /** @return {BoxTreeRoot} */
  get root() {
    return this.parent.root;
  }

  /** @returns {PageBox} */
  get rootPage() {
    return this.root.ownBox;
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    this.ownBox.setPosition({
      x: "left",
      y: "bottom",
      point: new FreePointer(this.leftBottomCorner.x, this.leftBottomCorner.y),
    });
    this.ownBox.drawToPdfPage(page);
  }

  /** @return {number} */
  level() {
    return this.ownBox.level();
  }
  /** @param {Box} box */
  setParent(box) {
    console.error(new Error("").stack);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   */
  getBoxPointer(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {FreePointer}
   */
  getPoint(x, y) {
    return this.ownBox.getPoint(x, y);
  }

  /** @param {BorderPosition} border  */
  getBorder(border) {
    return this.ownBox.getBorder(border);
  }

  /**
   *
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.ownBox.setPosition(position);
  }
}
