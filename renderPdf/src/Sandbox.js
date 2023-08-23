import {
  PDFDocument,
  StandardFonts,
  rgb,
  layoutMultilineText,
  TextAlignment,
  PDFFont,
} from "pdf-lib";
import * as fs from "fs/promises";
import { Lenght, LEN } from "./Lenght";

const song = {
  title: "Die Lunge",
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

class Point {
  /** @type {Lenght} */
  x;
  /** @type {Lenght} */
  y;

  /**
   *
   * @param {Lenght} x
   * @param {Lenght} y
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /** @param {Point} other */
  isBelow(other) {
    return this.y.lt(other.y);
  }

  /** @param {Point} other */
  isAbove(other) {
    return this.y.gt(other.y);
  }

  /** @param {Point} other */
  isLeftFrom(other) {
    return this.x.lt(other.x);
  }

  /** @param {Point} other */
  isRightFrom(other) {
    return this.x.gt(other.x);
  }

  /** @param {Lenght} len */
  pushDownBy(len) {
    return new Point(this.x, this.y.sub(len));
  }

  /** @param {Lenght} len*/
  pushRightBy(len) {
    return new Point(this.x.add(len), this.y);
  }

  /** @param {Point[]} points*/
  static highest(points) {
    return points.reduce((prev, curr) => {
      if (prev.isAbove(curr)) {
        return prev;
      }
      return curr;
    });
  }

  /** @param {Point[]} points*/
  static lowest(points) {
    return points.reduce((prev, curr) => {
      if (prev.isBelow(curr)) {
        return prev;
      }
      return curr;
    });
  }

  /** @param {Point[]} points*/
  static leftMost(points) {
    return points.reduce((prev, curr) => {
      if (prev.isLeftFrom(curr)) {
        return prev;
      }
      return curr;
    });
  }

  /** @param {Point[]} points*/
  static rightMost(points) {
    return points.reduce((prev, curr) => {
      if (prev.isRightFrom(curr)) {
        return prev;
      }
      return curr;
    });
  }

  /**
   * @param  {Point[]} points
   */
  static minimalEnlosingBox(points) {
    if (points.length === 0) return;
    const top = Point.highest(points).x;
    const bottom = Point.lowest(points).x;
    const left = Point.leftMost(points).y;
    const right = Point.rightMost(points).y;
    const topLeftCorner = new Point(left, top);
    const bottomRightCorner = new Point(right, bottom);
    return new Box(topLeftCorner, bottomRightCorner);
  }
}

class Box {
  /**@type {Point} */
  _topLeftCorner;
  /**@type {Point} */
  _bottomRightCorner;

  /**
   *
   * @param {Point} topLeftCorner
   * @param {Point} bottomRightCorner
   */
  constructor(topLeftCorner, bottomRightCorner) {
    this._topLeftCorner = topLeftCorner;
    this._bottomRightCorner = bottomRightCorner;
  }

  topLeftCorner() {
    return this._topLeftCorner;
  }
  bottomRightCorner() {
    return this._bottomRightCorner;
  }

  leftPo;

  width() {
    this._bottomRightCorner;
  }
}

class VirtualTextBox {
  /**
   * @type {VirtualText[]}
   */
  childeren = [];

  /**
   *
   * @param {VirtualText[]} childeren
   */
  constructor(childeren) {
    this.childeren = childeren;
  }

  box() {
    const topLeftCorner = Point.minimalEnlosingBox(
      this.childeren.map((c) => c.box.topLeftCorner())
    ).topLeftCorner();
    const bottomRightCorner = Point.minimalEnlosingBox(
      this.childeren.map((c) => c.box.bottomRightCorner())
    ).bottomRightCorner();
    return new Box(topLeftCorner, bottomRightCorner);
  }
}

/**
 * @typedef {object} TextApperance
 * @property {Lenght} fontSize
 * @property {PDFFont} font
 */

class VirtualText {
  /** @type {string} */
  text;

  /** @type {TextApperance} */
  apperance;

  /** @type {Box} */
  box;

  /**
   * @readonly
   * @type {Point}
   */
  _topLeftCorner;

  /**
   * @param {string} text
   * @param {TextApperance} apperance
   */
  constructor(text, apperance, topLeftCorner) {
    this.text = text;
    this.style = apperance;
    const width = LEN(
      this.apperance.font.widthOfTextAtSize(
        this.text,
        this.apperance.fontSize.in("pt")
      ),
      "pt"
    );

    const height = LEN(
      this.apperance.font.heightAtSize(this.apperance.fontSize.in("pt")),
      "pt"
    );

    const bottomRightCorner = topLeftCorner
      .pushDownBy(height)
      .pushRightBy(width);
    this.box = new Box(topLeftCorner, bottomRightCorner);
  }

  /**
   * @return {VirtualTextBox}
   */
  splitBehind() {
    this.text.split("");
  }
}

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
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
