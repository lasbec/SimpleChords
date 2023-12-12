export function printPdfFilesFromPaths(args: MainPathArgs): Promise<void>;
export function printPdfFiles({ inputPath, outPath, debug, style: theme, }: MainArgs): Promise<void>;
export * from "./Shared/Length.js";
export type MainArgs = {
    inputPath: string | string[];
    outPath: string | undefined;
    debug: boolean;
    style?: LayoutConfigDto | undefined;
};
export type MainPathArgs = {
    inputPath: string | string[];
    outPath: string | undefined;
    debug: boolean;
    stylePath?: string | undefined;
};
export type LayoutConfigDto = import("./SongLayout/LayoutConfig.js").LayoutConfigDto;
export type LayoutConfig = import("./SongLayout/LayoutConfig.js").LayoutConfig;
export type TextConfigArgs = import("./Drawing/TextConfig.js").TextConfigArgs;
export type TextConfigDto = import("./Drawing/TextConfig.js").TextConfigDto;
export { DefaultLayoutConfigDto, parseLayoutConfigDto } from "./SongLayout/LayoutConfig.js";
