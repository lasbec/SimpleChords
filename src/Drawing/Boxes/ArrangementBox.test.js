import { it } from "vitest";
import { describe } from "vitest";
import { ArragmentBox } from "./ArrangementBox.js";
import { BoundsImpl } from "../Figures/BoundsImpl.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { PointImpl } from "../Figures/PointImpl.js";
import { LEN } from "../../Shared/Length.js";
import { expect } from "vitest";
import { DebugBox } from "./DebugBox.js";

describe("ArrangementBox", () => {
  it("Minimal width and hight ", () => {
    const minRect = RectangleImpl.fromCorners(
      PointImpl.origin(),
      PointImpl.origin().moveUp(LEN(50, "mm")).moveRight(LEN(60, "mm"))
    );
    const hob = new ArragmentBox([], BoundsImpl.minBoundsFrom(minRect));
    expect([
      hob.rectangle.width.in("mm").toFixed(8),
      hob.rectangle.height.in("mm").toFixed(8),
    ]).toEqual(["60.00000000", "50.00000000"]);
  });
  it("Exact width no hight ", () => {
    const hob = new ArragmentBox(
      [],
      BoundsImpl.from({
        minWidth: LEN(50, "mm"),
        maxWidth: LEN(50, "mm"),
      })
    );
    expect([
      hob.rectangle.width.in("mm").toFixed(8),
      hob.rectangle.height.in("mm").toFixed(8),
    ]).toEqual(["50.00000000", "0.00000000"]);
  });
  it("Exact width no hight with child", () => {
    const hob = new ArragmentBox(
      [],
      BoundsImpl.from({
        minWidth: LEN(50, "mm"),
        maxWidth: LEN(50, "mm"),
      })
    );
    const child = new DebugBox(
      PointImpl.origin().moveUp(LEN(50, "mm")).moveRight(LEN(60, "mm"))
    );
    hob.appendChild(child);
    expect([
      hob.rectangle.width.in("mm").toFixed(8),
      hob.rectangle.height.in("mm").toFixed(8),
    ]).toEqual(["50.00000000", "3.00000000"]);
  });
  it("two children; unbound", () => {
    const leftBottom = new DebugBox(PointImpl.origin());
    const rightTop = new DebugBox(
      PointImpl.origin().moveUp(LEN(50, "mm")).moveRight(LEN(60, "mm"))
    );
    const hob = new ArragmentBox([leftBottom, rightTop], BoundsImpl.unbound());
    expect([
      hob.rectangle.width.in("mm").toFixed(8),
      hob.rectangle.height.in("mm").toFixed(8),
      hob.rectangle.getPoint("left", "bottom").x.in("mm").toFixed(8),
      hob.rectangle.getPoint("left", "bottom").y.in("mm").toFixed(8),
      hob.rectangle.getPoint("right", "top").x.in("mm").toFixed(8),
      hob.rectangle.getPoint("right", "top").y.in("mm").toFixed(8),
    ]).toEqual([
      "63.00000000",
      "53.00000000",
      "-1.50000000",
      "-1.50000000",
      "61.50000000",
      "51.50000000",
    ]);
  });

  it("Fixed size", () => {
    const page = ArragmentBox.newPage({
      width: LEN(210, "mm"),
      height: LEN(297, "mm"),
    });
    const widthBefore = page.rectangle.width.in("mm").toFixed(8);
    const heightBefore = page.rectangle.height.in("mm").toFixed(8);
    page.appendChild(new DebugBox(PointImpl.origin()));
    const widthAfter = page.rectangle.width.in("mm").toFixed(8);
    const heightAfter = page.rectangle.height.in("mm").toFixed(8);

    expect([widthBefore, heightBefore]).toEqual([widthAfter, heightAfter]);
  });
});
