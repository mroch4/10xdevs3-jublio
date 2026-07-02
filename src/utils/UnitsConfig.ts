import { DateTimeUnit } from "./enums/DateTimeUnit";
import UnitConfig from "./classes/UnitConfig";

export const UnitsConfig: UnitConfig[] = [
  new UnitConfig(DateTimeUnit.Seconds, 3, 10),
  new UnitConfig(DateTimeUnit.Minutes, 2, 8),
  new UnitConfig(DateTimeUnit.Hours, 2, 6),
  new UnitConfig(DateTimeUnit.Days, 1, 5),
  new UnitConfig(DateTimeUnit.Weeks, 1, 4),
  new UnitConfig(DateTimeUnit.Years, 1, 4),
];
