export function textConfigForSectionType(sectionType: string, layoutConfig: LayoutConfig): {
    chordsConfig: {
        text: import("../Drawing/TextConfig.js").TextConfig;
        unify: boolean;
    };
    lyricConfig: import("../Drawing/TextConfig.js").TextConfig;
};
export type LayoutConfig = import("./SongSectionBox.js").LayoutConfig;
