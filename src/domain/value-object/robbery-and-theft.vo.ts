import { StringOrNull } from 'src/domain/types';

export type RobberyAndTheftVo = {
  readonly containsOccurrence: boolean;
  readonly containsActiveOccurrence: boolean;
  readonly historic: ReadonlyArray<RobberyAndTheftHistoricData>;
  readonly indicatorProvenance: StringOrNull;
  readonly licencePlateCity: StringOrNull;
};

export type RobberyAndTheftHistoricData = {
  readonly chassis: StringOrNull;
  readonly color: StringOrNull;
  readonly occurrenceDate: StringOrNull;
  readonly declaration: StringOrNull;
  readonly modelBrand: StringOrNull;
  readonly occurrenceCity: StringOrNull;
  readonly occurrence: StringOrNull;
  readonly plate: StringOrNull;
  readonly reportCard: StringOrNull;
  readonly ufOccurrence: StringOrNull;
};
