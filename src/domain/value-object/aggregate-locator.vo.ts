import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type AggregateLocatorVo = {
  readonly manufactureYear: NumberOrNull;
  readonly modelYear: NumberOrNull;
  readonly imagemUrl: StringOrNull;
  readonly brand: StringOrNull;
  readonly model: StringOrNull;
  readonly details: StringOrNull;
  readonly part: StringOrNull;
  readonly vehicleType: StringOrNull;
};
