import { PDFPage } from "pdf-lib";
import { Length } from "../Length.js";
import { Page as PageBox } from "./Boxes/PageBox.js";
import { FreePointer } from "./FreePointer.js";

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

export type BoxPosition = {
  getPointerAt(x: XStartPosition, y: YStartPosition): FreePointer;
};

export type DetachedBox = {
  drawToPdfPage(page: PDFPage, position: BoxPosition): void;
  width: Length;
  height: Length;
};
