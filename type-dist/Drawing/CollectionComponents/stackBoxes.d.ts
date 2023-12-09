export function stack(boxes: ({
    content: Box;
    style: StackBlockStyle;
} | Box)[], defaultStyle: StackBlockStyle, boundsGen: RectGen): Box[];
export type XStartPosition = import("../Geometry.js").XStartPosition;
export type Rectangle = import("../Geometry.js").Rectangle;
export type RectGen = import("../Geometry.js").RectangleGenerator;
export type Box = import("../Geometry.js").Box;
export type StackBlockStyle = {
    sectionDistance: Length;
    alignment: XStartPosition;
};
import { Length } from "../../Shared/Length.js";
