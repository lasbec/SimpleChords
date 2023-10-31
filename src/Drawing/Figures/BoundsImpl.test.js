import { it } from "vitest";
import { describe } from "vitest";
import { BoundsImpl } from "./BoundsImpl.js";
import { PointImpl } from "./PointImpl.js";
import { LEN } from "../../Shared/Length.js";
import { RectangleImpl } from "./RectangleImpl.js";
import { expect } from "vitest";

describe("BoundsImpl", () => {
  it("minBoundFrom", () => {
    const minRect = RectangleImpl.fromCorners(
      PointImpl.origin(),
      PointImpl.origin().moveUp(LEN(50, "mm")).moveRight(LEN(60, "mm"))
    );
    const bounds = BoundsImpl.minBoundsFrom(minRect);
    expect({
      maxWidth: bounds.width("max")?.in("mm")?.toFixed(8),
      minWidth: bounds.width("min")?.in("mm")?.toFixed(8),
      maxRight: bounds.right("max")?.x.in("mm")?.toFixed(8),
      minRight: bounds.right("min")?.x.in("mm")?.toFixed(8),
      maxLeft: bounds.left("max")?.x.in("mm")?.toFixed(8),
      minLeft: bounds.left("min")?.x.in("mm")?.toFixed(8),
      maxHeight: bounds.height("max")?.in("mm")?.toFixed(8),
      minHeight: bounds.height("min")?.in("mm")?.toFixed(8),
      maxTop: bounds.top("max")?.y.in("mm")?.toFixed(8),
      minTop: bounds.top("min")?.y.in("mm")?.toFixed(8),
      maxBottom: bounds.bottom("max")?.y.in("mm")?.toFixed(8),
      minBottom: bounds.bottom("min")?.y.in("mm")?.toFixed(8),
    }).toEqual({
      minWidth: "60.00000000",
      minHeight: "50.00000000",
      minLeft: "0.00000000",
      minRight: "60.00000000",
      minTop: "50.00000000",
      minBottom: "0.00000000",
    });
  });
});
