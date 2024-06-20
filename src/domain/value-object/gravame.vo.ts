import { StringOrNull } from 'src/domain/types';

export type GravameVo = {
  readonly municipality: StringOrNull;
  readonly agent: StringOrNull;
  readonly manufactureYear: StringOrNull;
  readonly modelYear: StringOrNull;
  readonly chassis: StringOrNull;
  readonly agentCode: StringOrNull;
  readonly contract: StringOrNull;
  readonly issuanceDate: StringOrNull;
  readonly inclusionDate: StringOrNull;
  readonly agentDocument: StringOrNull;
  readonly financedDocument: StringOrNull;
  readonly responsible: StringOrNull;
  readonly number: StringOrNull;
  readonly observations: StringOrNull;
  readonly plate: StringOrNull;
  readonly uf: StringOrNull;
  readonly ufPlate: StringOrNull;
  readonly contractEffectiveDate: StringOrNull;
  readonly renavam: StringOrNull;
  readonly situation: StringOrNull;
};
