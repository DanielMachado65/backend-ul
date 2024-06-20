import { StringOrNull } from 'src/domain/types';

export type DebtsAndFinesVo = {
  readonly validState: boolean;
  readonly hasVehicle: boolean;
  readonly hasDebts: boolean;
  readonly protocol?: StringOrNull;
  readonly debts: ReadonlyArray<Debt>;
};

export type DebtRecord = {
  readonly externalId: StringOrNull;
  readonly createdAt: StringOrNull;
  readonly type: StringOrNull;
  readonly protocol: StringOrNull;
  readonly title: StringOrNull;
  readonly description: StringOrNull;
  readonly amountInCents: number;
  readonly dueDate: StringOrNull;
  readonly required: boolean;
  readonly distinct: ReadonlyArray<string>;
  readonly dependsOn: ReadonlyArray<string>;
};

export type Debt = {
  readonly type: StringOrNull;
  readonly totalValueInCents: number;
  readonly records: ReadonlyArray<DebtRecord>;
};
