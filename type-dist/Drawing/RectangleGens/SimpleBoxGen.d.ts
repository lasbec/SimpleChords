export class SimpleBoxGen implements RectGen {
    constructor(regular: Rectangle, begin?: PointImpl | undefined);
    begin: PointImpl | undefined;
    beginLeftTop: PointImpl;
    regular: import("../Geometry.js").Rectangle;
    private count;
    clone(): SimpleBoxGen;
    get(index: number): Rectangle;
    get lenght(): number;
    next(): import("../Geometry.js").Rectangle;
}
export type Rectangle = import("../Geometry.js").Rectangle;
export type RectGen = import("../Geometry.js").RectangleGenerator;
import { PointImpl } from "../Figures/PointImpl.js";
