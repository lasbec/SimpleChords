/**
 * @typedef {import("./Notes.js").Note} Note
 */

import { NoteDist } from "./NoteDistances.js";

/** @typedef {Uint8Array} Chord */

/** @param {Note} baseNote */
function minor(baseNote) {
  return Uint8Array.from([baseNote, NoteDist.KleineTerz, NoteDist.ReineQuinte]);
}
/** @param {Note} baseNote */
function minor7(baseNote) {
  return Uint8Array.from([
    baseNote,
    NoteDist.KleineTerz,
    NoteDist.ReineQuinte,
    NoteDist.KleineSeptime,
  ]);
}
/** @param {Note} baseNote */
function minorMajor7(baseNote) {
  return Uint8Array.from([
    baseNote,
    NoteDist.KleineTerz,
    NoteDist.ReineQuinte,
    NoteDist.GrosseSeptime,
  ]);
}
/** @param {Note} baseNote */
function minor6(baseNote) {
  return Uint8Array.from([
    baseNote,
    NoteDist.KleineTerz,
    NoteDist.ReineQuinte,
    NoteDist.GrosseSexte,
  ]);
}
/** @param {Note} baseNote */
function minorAdd9(baseNote) {
  return Uint8Array.from([
    baseNote,
    NoteDist.KleineTerz,
    NoteDist.ReineQuinte,
    NoteDist.GrosseNone,
  ]);
}
