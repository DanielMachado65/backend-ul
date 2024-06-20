import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type KmHistory = {
  readonly km: NumberOrNull;
  readonly includedDate: StringOrNull;
};

export type KmBaseVo = {
  readonly plate: StringOrNull;
  readonly chassis: StringOrNull;
  readonly renavam: StringOrNull;
  readonly city: StringOrNull;
  readonly uf: StringOrNull;
  readonly kmHistory: ReadonlyArray<KmHistory>;
};
