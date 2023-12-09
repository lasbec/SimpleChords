export class TextConfig {
    constructor(args: TextConfigArgs);
    fontSize: Length;
    font: PDFFont;
    get fontName(): string;
    get lineHeight(): Length;
    widthOfText(text: string): Length;
}
export type LengthDto = import("../Shared/Length.js").LengthDto;
export type TextConfigDto = {
    fontSize: LengthDto;
    font: string;
};
export type TextConfigArgs = {
    fontSize: Length;
    font: PDFFont;
};
import { Length } from "../Shared/Length.js";
import { PDFFont } from "pdf-lib";
