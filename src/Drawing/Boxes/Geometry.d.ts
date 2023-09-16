import { PDFPage } from "pdf-lib";
import { Length } from "../../Length.js";
import { Page as PageBox } from "./PageBox.js";

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

export type BoxCoordinates = {
  getCoordinates(x: XStartPosition, y: YStartPosition): Point;
};

export type DetachedBox = {
  drawToPdfPage(page: PDFPage, coordinates: BoxCoordinates): void;
  width: Length;
  height: Length;
};
