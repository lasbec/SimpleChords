/** @typedef {"mm" | "pt"} UnitName */
/**
 * @param {string} str
 * @returns {str is UnitName}
 */
function isValidUnitName(str) {
  return ["mm", "pt"].includes(str);
}

/** @typedef {`${number}${UnitName}`} LengthDto */

/**
 * @param {number} value
 * @param {UnitName} unit
 * @returns {Length}
 */
export function LEN(value, unit) {
  return new Length(value, unit);
}

export class Length {
  /**
   * @private
   * @readonly
   * @type {number}
   */
  value;

  /**
   * @private
   * @readonly
   * @type {UnitName}
   */
  unit;

  /**
   * @param {number} value
   * @param {UnitName} unit
   */
  constructor(value, unit) {
    this.value = value;
    this.unit = unit;
  }

  /**
   * @param {Length} arg0
   * @param  {...Length} args
   */
  static safeMax(arg0, ...args) {
    let currMax = arg0;
    for (const l of args) {
      if (l.gt(currMax)) {
        currMax = l;
      }
    }
    return currMax;
  }
  /**
   * @param  {Array<Length>} args
   * @returns {Length | undefined}
   */
  static max(args) {
    /** @type {Length} */
    let currMax = args[0];
    for (const l of args) {
      if (l.gt(currMax)) {
        currMax = l;
      }
    }
    return currMax;
  }

  /**
   *
   * @param {UnitName=} unit
   */
  toString(unit) {
    const _unit = unit || this.unit;
    return `${this.in(_unit)}${_unit}`;
  }

  /**
   * @param {string} str
   */
  static fromString(str) {
    const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let i = 0;
    let char = str[i];
    while (digits.includes(char)) {
      i += 1;
      char = str[i];
    }
    if (!i) throw new Error(`Unexpected '${str[0]}' at start of string.`);
    if (char === ".") {
      i += 1;
      char = str[i];
      if (!digits.includes(char))
        throw new Error(`Unexpected '${char}' after '.'`);
      while (digits.includes(char)) {
        i += 1;
        char = str[i];
      }
    }
    const valueStr = str.slice(0, i);
    const unitStr = str.slice(i);
    if (!isValidUnitName(unitStr)) {
      throw new Error(`Invalid unit '${unitStr}'.`);
    }
    return LEN(parseFloat(valueStr), unitStr);
  }

  /**
   *
   * @param {UnitName} unit
   * @return {number}
   */
  in(unit) {
    if (this.unit === unit) {
      return this.value;
    }
    if (this.unit === "mm") {
      return this.value * 2.8346456693;
    }
    if (this.unit === "pt") {
      return this.value * 0.3527777778;
    }
    throw new Error(`Invalid lenght unit '${unit}'.`);
  }

  /**
   *
   * @param {Length} other
   * @return {Length}
   */
  sub(other) {
    if (this.unit === other.unit) {
      return LEN(this.value - other.value, this.unit);
    }
    return LEN(this.in("pt") - other.in("pt"), "pt");
  }

  /**
   * @param {Length} other
   * @return {Length}
   */
  add(other) {
    if (this.unit === other.unit) {
      return LEN(this.value + other.value, this.unit);
    }
    return LEN(this.in("pt") + other.in("pt"), "pt");
  }

  /**
   * @param {number} scalar
   * @return {Length}
   */
  mul(scalar) {
    return LEN(this.value * scalar, this.unit);
  }

  /** @param {Length} other */
  lt(other) {
    return this.in("pt") < other.in("pt");
  }

  /** @param {Length} other */
  gt(other) {
    return this.in("pt") > other.in("pt");
  }

  gtz() {
    return this.value > 0;
  }

  abs() {
    return new Length(Math.abs(this.value), this.unit);
  }

  isZero() {
    return this.value === 0;
  }

  static zero = new Length(0, "pt");

  atLeastZero() {
    if (this.value < 0) {
      return Length.zero;
    }
    return this;
  }

  maximumZero() {
    if (this.value > 0) {
      return Length.zero;
    }
    return this;
  }
}
