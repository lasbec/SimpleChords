export class BreakableText<StrLike extends StrLikeConstraint> {
    static fromString<StrLike_1 extends StrLikeConstraint>(strImpl: StrLikeImpl<StrLike_1>, str: StrLike_1, favor?: "middle" | "right"): BreakableText<StrLike_1>;
    static fromPrefferdLineUp<StrLike_2 extends StrLikeConstraint>(strImpl: StrLikeImpl<StrLike_2>, lines: StrLike_2[], favor?: "middle" | "right"): BreakableText<StrLike_2>;
    private constructor();
    strImpl: StrLikeImpl<StrLike>;
    text: StrLike;
    lenght: number;
    favor: "middle" | "right";
    favoriteBreakingIndices: number[];
    slice(start: number, stop?: number | undefined): BreakableText<StrLike>;
    firstNotEmptyCharIndex(): number | undefined;
    lastNotEmptyCharIndex(): number | undefined;
    trim(): BreakableText<StrLike>;
    break(_args: LineBreakingArgs): [StrLike, BreakableText<StrLike>, number];
    getMostPreferrableLineLengths(args: LineBreakingArgs): {
        result: Array<number>;
        badness: number;
    };
    prioLastLength(args: LineBreakingArgs): Array<number>;
    prio3Length(args: LineBreakingArgs): Array<number>;
    prio4Length(args: LineBreakingArgs): Array<number>;
    prio2Length(args: LineBreakingArgs): Array<number>;
    prio1Length(args: LineBreakingArgs): Array<number>;
}
export type FindIndicesOfArgs = {
    findIn: StrLikeConstraint;
    searchFor: string[];
};
export type StrLikeImpl<StrLike> = {
    slice(s: StrLike, start: number, stop?: number): StrLike;
    concat(s: StrLike[]): StrLike;
    emptyAt(s: StrLike, index: number): boolean | undefined;
};
export type StrLikeConstraint = Iterable<string> & {
    length: number;
    charAt(index: number): string;
    toString(): string;
};
export type BreakUntilPredicate<StrLike> = (str: StrLike) => LineBreakingArgs | undefined;
export type LineBreakingArgs = {
    maxLineLen: number;
    minLineLen: number;
};
