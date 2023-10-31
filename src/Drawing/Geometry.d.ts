import { PDFPage } from "pdf-lib";
import { Length } from "../Shared/Length.js";
import { PointImpl } from "./Figures/PointImpl.js";
import { RectangleImpl } from "./Figures/RectangleImpl.js";
export { Point } from "./CoordinateSystemSpecifics/Figures.d.ts";

export type Movement = {
  change(point: Point);
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

export type ReferencePoint = {
  pointOnRect: PointOnRect;
  pointOnGrid: PointImpl;
};

type BaseBox = {
  level(): number;
  drawToPdfPage(page: PDFPage): void;
  parent: Box | null;
  root: Box;

  rectangle: Rectangle;
  setPosition(position: ReferencePoint): void;
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
  getPoint(x: XStartPosition, y: "top"): PointImpl;
  width: Length;
};

export type RectNoRight = {
  getBorder(border: Omit<BorderPosition, "right">): Length;
  getPoint(x: XStartPosition, y: "left"): PointImpl;
  width: Length;
};

export type Rectangle = {
  getBorder(border: BorderPosition): Length;
  getPoint(x: XStartPosition, y: YStartPosition): PointImpl;
  getPointAt(point: PointOnRect): PointImpl;
  referencePoint(): ReferencePoint;

  clone(): MutRectangle;

  width: Length;
  height: Length;
};

export type PartialRectangle = Partial<Record<BorderPosition, Length>> & {
  width?: Length;
  height?: Length;
};

export type MutRectangle = Rectangle & {
  setPosition(position: ReferencePoint): void;
};

export type IntervalRestrictions = {
  maxValue?: Length;
  minValue?: Length;
  maxUpper?: Length;
  minUpper?: Length;
  maxLower?: Length;
  minLower?: Length;
};

export type RectangleRestrictions = {
  maxWidth?: Length;
  minWidth?: Length;
  maxRight?: Length;
  minRight?: Length;
  maxLeft?: Length;
  minLeft?: Length;

  maxHeight?: Length;
  minHeight?: Length;
  maxTop?: Length;
  minTop?: Length;
  maxBottom?: Length;
  minBottom?: Length;
};
