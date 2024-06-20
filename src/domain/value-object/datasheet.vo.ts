import { StringOrNull } from 'src/domain/types';

export type DatasheetRecord = {
  readonly description: StringOrNull;
  readonly specs: ReadonlyArray<DatasheetRecordSpec>;
};

export type DatasheetRecordSpec = {
  readonly property: StringOrNull;
  readonly value: StringOrNull;
};

export class DatasheetVo {
  readonly fipeId: number;
  readonly modelYear: number;
  readonly records: ReadonlyArray<DatasheetRecord>;
}
