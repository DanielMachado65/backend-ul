import { DateOrNull, StringOrNull } from 'src/domain/types';

export type RenajudVo = {
  readonly codeCourt: StringOrNull;
  readonly judicialBody: StringOrNull;
  readonly process: StringOrNull;
  readonly restrictions: StringOrNull;
  readonly court: StringOrNull;
  readonly inclusionDate: DateOrNull;
  readonly detailRenajud: StringOrNull;
  readonly consistsRenajud: boolean;
};
