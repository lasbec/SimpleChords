import * as path from "path";
import { PDFDocument } from "pdf-lib";
import * as fs from "fs/promises";
import fontkit from "@pdf-lib/fontkit";

export class FontLoader {
  /** @type {string} */
  localFontDirectory;

  /**
   * @param {string} localFontDirectory
   */
  constructor(localFontDirectory) {
    this.localFontDirectory = localFontDirectory;
  }

  /**
   * @param {PDFDocument} pdfDoc
   * @param {string} fontFilePath
   * @returns
   */
  async loadFontIntoDoc(pdfDoc, fontFilePath) {
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fs.readFile(
      path.join(this.localFontDirectory, fontFilePath)
    );
    return await pdfDoc.embedFont(fontBytes);
  }
}
