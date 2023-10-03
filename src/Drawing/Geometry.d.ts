import { PDFPage } from "pdf-lib";
import { Length } from "../Length.js";
import { Page as PageBox } from "./Boxes/PageBox.js";
import { FreePointer } from "./FreePointer.js";
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
  point: FreePointer;
};

export type Box = {
  setPosition(position: BoxPlacement): void;
  level(): number;
  setParent(box: Box): void;
  getPoint(x: XStartPosition, y: YStartPosition): FreePointer;
  getBorder(border: BorderPosition): Length;
  drawToPdfPage(page: PDFPage): void;
  appendNewPage(): BoxTreeNode;
  width: Length;
  height: Length;

  document: Document | null;
  parent: Box | null;
  root: Box;
};
