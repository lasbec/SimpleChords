import { PDFFont } from "pdf-lib";
import { Lenght } from "./Boxes/BoxDrawingUtils.js";

export type TextConfig = {
  fontSize: Lenght;
  font: PDFFont;
};
