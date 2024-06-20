import { StringOrNull } from 'src/domain/types';

export type AuctionVo = {
  readonly auctionDate: StringOrNull;
  readonly auctioneer: StringOrNull;
  readonly batch: StringOrNull;
  readonly model: StringOrNull;
  readonly brand: StringOrNull;
  readonly plate: StringOrNull;
  readonly chassis: StringOrNull;
  readonly color: StringOrNull;
  readonly fuel: StringOrNull;
  readonly vehicleCategory: StringOrNull;
  readonly chassisSituation: StringOrNull;
  readonly engineNumber: StringOrNull;
  readonly axisAmount: StringOrNull;
  readonly courtyard: StringOrNull;
  readonly principal: StringOrNull;
  readonly modelYear: StringOrNull;
  readonly manufactureYear: StringOrNull;
  readonly generalCondition: StringOrNull;
};

export type AuctionScoreVo = {
  readonly acceptance: string;
  readonly score: string;
  readonly punctuation: string;
  readonly specialInspectionRequirement: string;
  readonly percentageOverRef: string;
};
