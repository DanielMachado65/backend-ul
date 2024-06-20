import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type ModelDataVo = {
  readonly brand: StringOrNull;
  readonly model: StringOrNull;
  readonly modelBrandCode: NumberOrNull;
  readonly modelYear: NumberOrNull;
  readonly segmentation: StringOrNull;
  readonly origin: StringOrNull;
  readonly vehicleType: StringOrNull;
  readonly passengerCapacity: NumberOrNull;
};
