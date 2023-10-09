import { PDFPage } from "pdf-lib";
import { Length } from "../Length.js";
import { Page as PageBox } from "./Boxes/PageBox.js";
import { MutableFreePointer } from "./FreePointer.js";
import { Document } from "./Document.js";
import { BoxTreeNode } from "./BoxTreeNode.js";

export type Point = {
  x: Length;
  y: Length;
};

export type Dimensions = {
  width: Length;
  height: Length;
};

export type XStartPosition = "left" | "center" | "right";
export type YStartPosition = "top" | "center" | "bottom";
export type BorderPosition = "left" | "top" | "right" | "bottom";

export type BoxPlacement = {
  x: XStartPosition;
  y: YStartPosition;
  point: MutableFreePointer;
};

export type Box = {
  level(): number;
  setParent(box: Box): void;
  drawToPdfPage(page: PDFPage): void;
  appendNewPage(): BoxTreeRoot;
  appendChild(box: Box): void;
  document: Document | null;
  parent: Box | null;
  root: Box;

  setPosition(position: BoxPlacement): void;

  getPoint(x: XStartPosition, y: YStartPosition): MutableFreePointer;
  getBorder(border: BorderPosition): Length;
  width: Length;
  height: Length;
};

export type Rectangle = {
  getPoint(x: XStartPosition, y: YStartPosition): MutableFreePointer;
  getBorder(border: BorderPosition): Length;
  width: Length;
  height: Length;
};

export type MutRectangle = Rectangle & {
  setPosition(position: BoxPlacement): void;
};
