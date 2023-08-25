import {
  PDFDocument,
  StandardFonts,
  rgb,
  layoutMultilineText,
  TextAlignment,
} from "pdf-lib";
import * as fs from "fs/promises";

const song = {
  title: "Der Wagen",
  chords: {
    verse: ["a", "F", "G", "a", "F", "G", "a", "F", "G", "d", "a", "E", "a"],
    interlude: ["F", "G", "a", "a"],
  },
  sections: [
    {
      type: "verse",
      text: "Weit, weit und grau der Weg und uns're Stiefel steh'n starr vor Dreck. Die Fahrt vorbei - in träumen zieh'n wir im Wagen nochmals dahin",
      chord_indices: [2, 4, 8, 16, 25, 32, 54, 64, 77, 88, 99, 124, 133],
    },
  ],
};

async function createPdf() {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 20;

  const layouting = layoutMultilineText(song.sections[0].text, {
    alignment: TextAlignment.Left,
    fontSize,
    font: timesRomanFont,
    bounds: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  });

  for (const textLayout of layouting.lines) {
    page.drawText(textLayout.text, {
      x: textLayout.x,
      y: textLayout.y + layouting.lineHeight,
      size: layouting.fontSize,
      font: timesRomanFont,
    });
  }
  page.drawText("Creating PDFs in JavaScript is awesome!", {
    x: 0,
    y: 0, //height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0.53, 0.71),
  });
  console.log(layouting);
  const pdfBytes = await pdfDoc.save();
  await fs.writeFile("./test.pdf", pdfBytes);
}

createPdf();
