/**
 * @typedef {typeof NoteDist[keyof typeof NoteDist]} NoteDist
 */

export const NoteDist = /** @type {const} */ {
  VerminderteTerz: 2,
  KleineTerz: 3,
  GrosseTerz: 4,
  UebermaessigeTerz: 5,

  VerminderteQuinte: 6,
  ReineQuinte: 7,
  UebermaessigeQuinte: 8,

  VerminderteSexte: 7,
  KleineSexte: 8,
  GrosseSexte: 9,
  UebermaessigeSexte: 10,

  VerminderteSeptime: 9,
  KleineSeptime: 10,
  GrosseSeptime: 11,
  UebermaessigeSeptime: 12,

  KleineNone: 13,
  GrosseNone: 14,
};
