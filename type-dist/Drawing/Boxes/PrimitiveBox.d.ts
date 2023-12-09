export class PrimitiveBox<Content, Style> extends AbstractBox<Content, Style> {
    readonly __discriminator__: "leave";
}
import { AbstractBox } from "./AbstractBox.js";
