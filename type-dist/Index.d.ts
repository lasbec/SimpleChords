export function printPdfFiles({ inputPath, outPath, debug, style: theme, }: MainArgs): Promise<void>;
export { DefaultLayoutConfigDto } from "./SongLayout/LayoutConfig.js";
export * from "./Shared/Length.js";
export type MainArgs = {
    inputPath: string | string[];
    outPath: string | undefined;
    debug: boolean;
    style?: LayoutConfigDto | undefined;
};
export type LayoutConfigDto = import("./SongLayout/RenderSongAsPdf.js").LayoutConfigDto;
export type LayoutConfig = import("./SongLayout/RenderSongAsPdf.js").LayoutConfig;
export type TextConfigArgs = import("./Drawing/TextConfig.js").TextConfigArgs;
export type TextConfigDto = import("./Drawing/TextConfig.js").TextConfigDto;
