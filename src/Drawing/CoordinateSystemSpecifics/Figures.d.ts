import { Length } from "../../Shared/Length.js";

export type Point = {
  x: Length;
  y: Length;
};

export type VLine = {
  x: Length;
  y: undefined;
};
export type HLine = {
  x: undefined;
  y: Length;
};

export type Line = VLine | HLine;
