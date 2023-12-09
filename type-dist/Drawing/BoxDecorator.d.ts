export function decorateAsComponent<Content, Config>(drawChildrenFn: (content: Content, config: Config, box: Rectangle) => {
    children: Box[];
    rest?: Content | undefined;
}): (content: Content, config: Config, boxGen: BoxGenerator) => Box[];
export function decorateAsBox<Content, Config>(drawChildrenFn: (content: Content, config: Config, drawingStartPoint: PointImpl) => Box[]): (content: Content, config: Config, drawingStartPoint?: PointImpl | undefined) => Box;
export type Rectangle = import("./Geometry.js").Rectangle;
export type BoxPlacement = import("./Geometry.js").ReferencePoint;
export type Box = import("./Geometry.js").Box;
export type BoxGenerator = import("./Geometry.js").RectangleGenerator;
import { PointImpl } from "./Figures/PointImpl.js";
