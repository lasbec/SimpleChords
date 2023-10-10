import { PDFPage } from "pdf-lib";
import { Length } from "../Length.js";
import { PageBox } from "./Boxes/PageBox.js";
import { MutableFreePointer } from "./FreePointer.js";
import { Document } from "./Document.js";
import { FreeBox } from "./FreeBox.js";

export type Point = {
  x: Length;
  y: Length;
};

export type Dimensions = {
  width: Length;
  height: Length;
};

export type BoxGenerator = {
  next(): FreeBox;
};

export type XStartPosition = "left" | "center" | "right";
export type YStartPosition = "top" | "center" | "bottom";
export type BorderPosition = "left" | "top" | "right" | "bottom";

export type PointOnRect = {
  x: XStartPosition;
  y: YStartPosition;
};

export type RectanglePlacement = {
  pointOnRect: PointOnRect;
  pointOnGrid: MutableFreePointer;
};

export type Box = {
  level(): number;
  setParent(box: Box): void;
  drawToPdfPage(page: PDFPage): void;
  appendNewPage(): Box;
  appendChild(box: Box): void;
  document: Document | null;
  parent: Box | null;
  root: Box;

  rectangle: Rectangle;
  setPosition(position: RectanglePlacement): void;
};

export type Rectangle = {
  getBorder(border: BorderPosition): Length;
  getPoint(x: XStartPosition, y: YStartPosition): MutableFreePointer;
  getPointAt(point: PointOnRect): MutableFreePointer;
  width: Length;
  height: Length;
};

export type MutRectangle = Rectangle & {
  setPosition(position: RectanglePlacement): void;
};
