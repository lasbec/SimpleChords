export function printPdfFiles({ inputPath, outPath, debug, style: theme, }: MainArgs): Promise<void>;
export type LayoutConfig = import("./SongLayout/RenderSongAsPdf.js").LayoutConfigDto;
export type MainArgs = {
    inputPath: string | string[];
    outPath: string | undefined;
    debug: boolean;
    style?: LayoutConfig | undefined;
};
