import { Lenght } from "../Boxes/BoxDrawingUtils.js";
import { DetachedBox } from "../Boxes/Geometry.js";

export type HorizontalSquasher<Box extends DetachedBox> = {
  squash(box: Box): {
    toWidth(maxWidth: Lenght): Box;
  };
};

export type VerticalSquasher<Box extends DetachedBox> = {
  squash(box: Box): {
    toHeight(maxHeight: Lenght): Box;
  };
};

export type HorizontalBreaker<Box extends DetachedBox> = {
  break(box: Box): {
    beforeX(x: Lenght): [Box, Box];
  };
};

export type VerticalBreaker<Box extends DetachedBox> = {
  break(box: Box): {
    beforeY(y: Lenght): [Box, Box];
  };
};
