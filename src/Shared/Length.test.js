import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { LEN, Length } from "./Length.js";

describe("Length", () => {
  describe("fromString", () => {
    it("should parse 11mm", () => {
      expect(Length.fromString("11mm")).toEqual(LEN(11, "mm"));
    });
    it("should parse 17.58pt", () => {
      expect(Length.fromString("17.58pt")).toEqual(LEN(17.58, "pt"));
    });
    it("should parse 01.01pt", () => {
      expect(Length.fromString("01.01pt")).toEqual(LEN(1.01, "pt"));
    });
    it("should fail on .01pt", () => {
      expect(() => Length.fromString(".01pt")).toThrow(
        "Unexpected '.' at start of string."
      );
    });
    it("should fail on 1sec", () => {
      expect(() => Length.fromString("1sec")).toThrow("Invalid unit 'sec'.");
    });
    it("should fail on 1.mm", () => {
      expect(() => Length.fromString("1.mm")).toThrow(
        "Unexpected 'm' after '.'"
      );
    });
    it("should fail on empty string", () => {
      expect(() => Length.fromString("")).toThrow(
        "Unexpected 'undefined' at start of string."
      );
    });
    it("should fail on 18", () => {
      expect(() => Length.fromString("18")).toThrow("Invalid unit ''.");
    });
  });
});
