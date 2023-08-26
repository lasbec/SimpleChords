import { expect, test } from "vitest";
import { Page } from "./Page";
import { LEN } from "./Lenght";
import { describe } from "vitest";
import { it } from "vitest";
import { PDFDocument, StandardFonts } from "pdf-lib";

describe("PagePointer", () => {
  it("Debug Test", async () => {
    const page = new Page({ width: LEN(148.5, "mm"), height: LEN(210, "mm") });
    const topMargin = LEN(210, "mm").mul(0.1);
    expect(topMargin.in("mm")).toEqual(21);

    const pointer = page.getPointerAt("center", "top").moveDown(topMargin);
    expect(pointer.x.in("mm")).toBeCloseTo(148.5 / 2);
    expect(pointer.y.in("mm")).toBeCloseTo(189);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontSize = LEN(12, "pt");
    const titleBox = pointer.setText("right", "top", "Alles", {
      font,
      fontSize,
    });
    expect([
      titleBox._leftBottomCorner.x.in("mm"),
      titleBox._leftBottomCorner.y.in("mm"),
    ]).toEqual([pointer.x.in("mm"), pointer.y.in("mm")]);

    expect(pointer.x.in("mm")).toBeCloseTo(148.5 / 2);
    expect(pointer.y.in("mm")).toBeCloseTo(189);

    const titleBox2 = pointer.setText("left", "bottom", "Alles", {
      font,
      fontSize,
    });
    expect(titleBox2._leftBottomCorner.x.in("mm")).toBeLessThan(
      pointer.x.in("mm")
    );
    expect(titleBox2._leftBottomCorner.y.in("mm")).toBeLessThan(
      pointer.y.in("mm")
    );

    expect(pointer.x.in("mm")).toBeCloseTo(148.5 / 2);
    expect(pointer.y.in("mm")).toBeCloseTo(189);
  });

  describe("getPointer", () => {
    const dims = {
      width: LEN(100, "pt"),
      height: LEN(100, "pt"),
    };
    describe("left", () => {
      const xDir = "left";
      it("top", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "top");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([0, 100]);
      });
      it("center", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "center");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([0, 50]);
      });
      it("bottom", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "bottom");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([0, 0]);
      });
    });
    describe("center", () => {
      const xDir = "center";
      it("top", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "top");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([50, 100]);
      });
      it("center", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "center");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([50, 50]);
      });
      it("bottom", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "bottom");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([50, 0]);
      });
    });
    describe("right", () => {
      const xDir = "right";
      it("top", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "top");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([100, 100]);
      });
      it("center", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "center");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([100, 50]);
      });
      it("bottom", () => {
        const pointer = new Page(dims).getPointerAt(xDir, "bottom");
        expect([pointer.x.in("pt"), pointer.y.in("pt")]).toEqual([100, 0]);
      });
    });
  });
});
