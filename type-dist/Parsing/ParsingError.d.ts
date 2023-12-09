export function notNullish(x: unknown): boolean;
export class ParsingError extends Error {
    constructor(msg: string, args: ParsingErrorArgs);
    cursor: Cursor;
    expected: string | undefined;
    actual: string | undefined;
    hint: string | undefined;
}
export type Cursor = {
    lineIndex: number;
    charIndex: number;
};
export type ParsingErrorArgs = {
    cursor: Cursor;
    expected?: string | undefined;
    actual?: string | undefined;
    hint?: string | undefined;
};
