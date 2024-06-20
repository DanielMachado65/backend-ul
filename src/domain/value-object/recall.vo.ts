import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type RecallVo = {
  readonly modelYear: NumberOrNull;
  readonly chassis: StringOrNull;
  readonly returnDescription: StringOrNull;
  readonly details: ReadonlyArray<RecallDetail>;
  readonly brand: StringOrNull;
  readonly model: StringOrNull;
  readonly pendingRecalls: ReadonlyArray<PendingRecall>;
};

export type RecallDetail = {
  readonly campaignStartDate: StringOrNull;
  readonly defect: StringOrNull;
  readonly fullDescription: StringOrNull;
  readonly risk: StringOrNull;
};

export type PendingRecall = {
  readonly description: StringOrNull;
  readonly recordDate: StringOrNull;
  readonly identifier: StringOrNull;
  readonly situation: StringOrNull;
};
