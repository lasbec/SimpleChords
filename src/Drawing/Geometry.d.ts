import { PDFPage } from "pdf-lib";
import { Length } from "../Shared/Length.js";
import { MutableFreePointer } from "./FreePointer.js";
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

type BaseBox = {
  level(): number;
  drawToPdfPage(page: PDFPage): void;
  parent: Box | null;
  root: Box;

  rectangle: Rectangle;
  setPosition(position: RectanglePlacement): void;
};

export type LeaveBox = BaseBox & {
  __discriminator__: "leave";
};

export type ParentBox = BaseBox & {
  __discriminator__: "parent";
  appendChild(box: Box): void;
};

export type Box = ParentBox | LeaveBox;

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
  getAnyPosition(): RectanglePlacement;
  left: Length;
  right: Length;
  top: Length;
  bottom: Length;

  width: Length;
  height: Length;
};

export type MutRectangle = Rectangle & {
  setPosition(position: RectanglePlacement): void;
};
