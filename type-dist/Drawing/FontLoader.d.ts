export class FontLoader {
    constructor(localFontDirectory: string);
    localFontDirectory: string;
    loadFontIntoDoc(pdfDoc: PDFDocument, fontFilePath: string): Promise<import("pdf-lib").PDFFont>;
}
import { PDFDocument } from "pdf-lib";
