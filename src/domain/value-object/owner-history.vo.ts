import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type OwnerHistoryVo = {
  readonly total: NumberOrNull;
  readonly totalPF: NumberOrNull;
  readonly totalPJ: NumberOrNull;
  readonly firstRecord: StringOrNull;
  readonly lastRecord: StringOrNull;
  readonly ufs: ReadonlyArray<string>;
};
