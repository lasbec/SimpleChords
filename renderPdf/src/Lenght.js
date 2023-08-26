/** @typedef {"mm" | "pt"} UnitName */

/**
 * @param {number} value
 * @param {UnitName} unit
 * @returns {Lenght}
 */
export function LEN(value, unit) {
  return new Lenght(value, unit);
}

export class Lenght {
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
   * @param {Lenght} other
   * @return {Lenght}
   */
  sub(other) {
    if (this.unit === other.unit) {
      return LEN(this.value - other.value, this.unit);
    }
    return LEN(this.in("pt") - other.in("pt"), "pt");
  }

  /**
   * @param {Lenght} other
   * @return {Lenght}
   */
  add(other) {
    if (this.unit === other.unit) {
      return LEN(this.value + other.value, this.unit);
    }
    return LEN(this.in("pt") + other.in("pt"), "pt");
  }

  /**
   * @param {number} scalar
   * @return {Lenght}
   */
  mul(scalar) {
    return LEN(this.value * scalar, this.unit);
  }

  /** @param {Lenght} other */
  lt(other) {
    return this.in("pt") < other.in("pt");
  }

  /** @param {Lenght} other */
  gt(other) {
    return this.in("pt") > other.in("pt");
  }
}
