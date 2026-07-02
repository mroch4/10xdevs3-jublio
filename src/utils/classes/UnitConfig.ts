/// <summary>
/// Wrapper to define time units and the min/max values of exponent for the DateCard/DateTimeCard
/// Min and max are the ranges for exponent values (e.g., min=0, max=3 means 10^0 to 10^3)
/// </summary>
export default class UnitConfig {
  unit: string;
  minExponent: number;
  maxExponent: number;

  constructor(unit: string, minExponent: number, maxExponent: number) {
    this.unit = unit;
    this.minExponent = minExponent;
    this.maxExponent = maxExponent;
  }
}
