import { WellKnownSectionType } from "../Song/SongChecker.js";

/**
 * @typedef {import("./SongSectionBox.js").LayoutConfig} LayoutConfig
 */

/**
 * @param {string} sectionType
 * @param {LayoutConfig} layoutConfig
 * @returns
 */
export function textConfigForSectionType(sectionType, layoutConfig) {
  const lyricStyle =
    sectionType === WellKnownSectionType.Chorus
      ? layoutConfig.chorusTextConfig
      : sectionType === WellKnownSectionType.Refrain
      ? layoutConfig.refTextConfig
      : layoutConfig.lyricTextConfig;
  const chordTextConfig = layoutConfig.chordTextConfig;
  const config = {
    chordsConfig: chordTextConfig,
    lyricConfig: lyricStyle,
  };
  return config;
}
