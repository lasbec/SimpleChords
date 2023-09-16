import { PageBox } from "./PageBox.js";

export class BoxTreeNode {
  /** @type {Point} */
  leftBottomCorner;
  /** @type {DetachedBox} */
  ownBox;
  /** @type {BoxTreeNode} */
  parentNode;

  /**
   *
   * @param {Point} leftBottomCorner
   * @param {DetachedBox} ownBox
   * @param {BoxTreeNode} parentNode
   */
  constructor(leftBottomCorner, ownBox, parentNode) {
    this.leftBottomCorner = leftBottomCorner;
    this.ownBox = ownBox;
    this.parentNode = parentNode;
  }

  /** @returns {PageBox} */
  get rootPage() {
    if (this.ownBox instanceof PageBox) {
      return this.ownBox;
    }
    return this.parentNode.rootPage;
  }

  /**
   *
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    this.ownBox.drawToPdfPage(page, this.leftBottomCorner);
  }

  /** @return {number} */
  level() {
    if (this.ownBox instanceof PageBox) {
      return 0;
    }
    return 1 + this.parentNode.level();
  }
}
