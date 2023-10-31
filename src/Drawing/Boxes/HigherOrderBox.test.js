import { it } from "vitest";
import { describe } from "vitest";
import { HigherOrderBox } from "./HigherOrderBox.js";
import { BoundsImpl } from "../Figures/BoundsImpl.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { PointImpl } from "../Figures/PointImpl.js";
import { LEN } from "../../Shared/Length.js";
import exp from "constants";
import { expect } from "vitest";

describe("HigherOrderBox", () => {
  it("Minimal width and hight ", () => {
    const minRect = RectangleImpl.fromCorners(
      PointImpl.origin(),
      PointImpl.origin().moveUp(LEN(50, "mm")).moveRight(LEN(60, "mm"))
    );
    const hob = new HigherOrderBox([], BoundsImpl.minBoundsFrom(minRect));
    expect(hob.rectangle.width.in("mm")).toEqual(60);
    expect(hob.rectangle.height.in("mm")).toEqual(50);
  });
});
