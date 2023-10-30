import { PDFPage } from "pdf-lib";
import { Length } from "../Shared/Length.js";
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

export type RectangleGenerator = {
  get(index: number): Rectangle;
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
  drawToPdfPage(page: PDFPage): void;
  appendNewPage(): Box;
  appendChild(box: Box): void;
  document: Document | null;
  parent: Box | null;
  root: Box;

  rectangle: Rectangle;
  setPosition(position: RectanglePlacement): void;
};

export type RectNoBottom = {
  getBorder(border: Omit<BorderPosition, "bottom">): Length;
  getPoint(x: XStartPosition, y: "top"): MutableFreePointer;
  width: Length;
};

export type RectNoRight = {
  getBorder(border: Omit<BorderPosition, "right">): Length;
  getPoint(x: XStartPosition, y: "left"): MutableFreePointer;
  width: Length;
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
