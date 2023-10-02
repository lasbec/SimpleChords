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

export type BoxPlacement = {
  x: XStartPosition;
  y: YStartPosition;
  point: FreePointer;
};
export type PrimitiveBox = {
  setPosition(position: BoxPlacement): void;
  drawToPdfPage(page: PDFPage): void;
  width: Length;
  height: Length;
};

export type Printable = {
  drawToPdfPage(page: PDFPage): void;
};

export type HOBox = {
  setPosition(position: BoxPlacement): void;
  children: (Printable | HOBox)[];
  width: Length;
  height: Length;
};

export type Box = HOBox | PrimitiveBox;
