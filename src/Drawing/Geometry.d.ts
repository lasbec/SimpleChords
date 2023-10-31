import { PDFPage } from "pdf-lib";
import { Length } from "../Shared/Length.js";
import { PointImpl } from "./Figures/PointImpl.js";
import { RectangleImpl } from "./Figures/RectangleImpl.js";
import { Line } from "./CoordinateSystemSpecifics/Figures.d.ts";
import { HLineImpl } from "./Figures/HLineImpl.js";
import { VLineImpl } from "./Figures/VLineImpl.js";
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

export type Rectangle = {
  getBorderHorizontal(border: "top" | "bottom"): HLineImpl;
  getBorderVertical(border: "left" | "right"): VLineImpl;
  getBorder(border: BorderPosition): HLineImpl | VLineImpl;
  getPoint(x: XStartPosition, y: YStartPosition): PointImpl;
  getPointAt(point: PointOnRect): PointImpl;
  referencePoint(): ReferencePoint;

  clone(): MutRectangle;

  width: Length;
  height: Length;
};

export type PartialRectangle = {
  getBorderHorizontal(border: "top" | "bottom"): HLineImpl | undefined;
  getBorderVertical(border: "left" | "right"): VLineImpl | undefined;
  getBorder(border: BorderPosition): HLineImpl | VLineImpl | undefined;

  clone(): PartialRectangle;

  width: Length | undefined;
  height: Length | undefined;
};

export type MutRectangle = Rectangle & {
  setPosition(position: ReferencePoint): void;
};

export type RectangleBorders = {
  left: VLineImpl;
  right: VLineImpl;
  top: HLineImpl;
  bottom: HLineImpl;
};

export type IntervalRestrictions = {
  maxValue?: Length;
  minValue?: Length;
  maxUpper?: Length;
  minUpper?: Length;
  maxLower?: Length;
  minLower?: Length;
};

export type Bounds = {
  maxWidth?: Length;
  minWidth?: Length;
  maxRight?: VLineImpl;
  minRight?: VLineImpl;
  maxLeft?: VLineImpl;
  minLeft?: VLineImpl;

  maxHeight?: Length;
  minHeight?: Length;
  maxTop?: HLineImpl;
  minTop?: HLineImpl;
  maxBottom?: HLineImpl;
  minBottom?: HLineImpl;
};
