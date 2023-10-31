import { Length } from "../../Shared/Length.js";

export type Point = {
  x: Length;
  y: Length;
};

export type VLine = {
  x: undefined;
  y: Length;
};
export type HLine = {
  x: Length;
  y: undefined;
};

export type Line = VLine | HLine;
