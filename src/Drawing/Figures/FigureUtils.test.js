import { describe } from "vitest";
import { fitIntoBounds, minimalBoundingRectangleSafe } from "./FigureUtils.js";
import { it } from "vitest";
import { RectangleImpl } from "./RectangleImpl.js";
import { LEN, Length } from "../../Shared/Length.js";
import { PointImpl } from "./PointImpl.js";
import { BoundsImpl } from "./BoundsImpl.js";
import { VLineImpl } from "./VLineImpl.js";
import { expect } from "vitest";
import { PartialRectangleImpl } from "./PartialRectangleImpl.js";

describe("FigureUtils", () => {
  it("fitIntoBounds", () => {
    const rect = RectangleImpl.fromCorners(
      PointImpl.origin().moveLeft(LEN(100, "mm")).moveDown(LEN(400, "mm")),
      PointImpl.origin().moveUp(LEN(300, "mm")).moveRight(LEN(200, "mm"))
    );
    const bounds = BoundsImpl.from({
      maxLeft: VLineImpl.from({ x: LEN(10, "mm"), y: undefined }),
      minRight: VLineImpl.from({ x: LEN(2000, "mm"), y: undefined }),
    });
    const result = fitIntoBounds(rect, bounds);
    expect({
      left: result.getBorderVertical("left").x.in("mm").toFixed(7),
      right: result.getBorderVertical("right").x.in("mm").toFixed(7),
      top: result.getBorderHorizontal("top").y.in("mm").toFixed(7),
      bottom: result.getBorderHorizontal("bottom").y.in("mm").toFixed(7),
    }).toEqual({
      left: "10.0000000",
      right: "2000.0000000",
      top: "300.0000000",
      bottom: "-400.0000000",
    });
  });

  it("minimalBoundingRectangleSafe", () => {
    const rect = RectangleImpl.fromCorners(
      PointImpl.origin().moveLeft(LEN(100, "mm")).moveDown(LEN(400, "mm")),
      PointImpl.origin().moveUp(LEN(300, "mm")).moveRight(LEN(200, "mm"))
    );
    const bounds = PartialRectangleImpl.fromBorders({
      left: undefined,
      right: VLineImpl.from({ x: LEN(2000, "mm"), y: undefined }),
      top: undefined,
      bottom: undefined,
    });
    const result = minimalBoundingRectangleSafe(rect, bounds);
    expect({
      left: result.getBorderVertical("left")?.x.in("mm").toFixed(7),
      right: result.getBorderVertical("right")?.x.in("mm").toFixed(7),
      top: result.getBorderHorizontal("top")?.y.in("mm").toFixed(7),
      bottom: result.getBorderHorizontal("bottom")?.y.in("mm").toFixed(7),
    }).toEqual({
      left: undefined,
      right: "2000.0000000",
      top: undefined,
      bottom: undefined,
    });
  });
});
