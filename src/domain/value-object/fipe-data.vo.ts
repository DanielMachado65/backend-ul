import { NumberOrNull, StringOrNull } from 'src/domain/types';

export class FipeDataVo {
  readonly fipeId: StringOrNull;
  readonly modelBrandCode: NumberOrNull;
  readonly modelBrand: StringOrNull;
  readonly modelYear: NumberOrNull;
  readonly brand: StringOrNull;
  readonly model: StringOrNull;
  readonly version?: StringOrNull;
}

export type FipeHistoryRecord = {
  readonly month: NumberOrNull;
  readonly price: NumberOrNull;
  readonly year: NumberOrNull;
};

export class FipePriceHistoryVo {
  readonly fipeId: StringOrNull;
  readonly model: StringOrNull;
  readonly brand: StringOrNull;
  readonly fuel: StringOrNull;
  readonly modelYear: NumberOrNull;
  readonly version: StringOrNull;
  readonly history: ReadonlyArray<FipeHistoryRecord>;
}
