import { NumberOrNull, StringOrNull } from 'src/domain/types';

export type ComparativeVo = {
  readonly fipeId: StringOrNull;
  readonly brand: StringOrNull;
  readonly model: StringOrNull;
  readonly year: NumberOrNull;
  readonly overallPosition: NumberOrNull;
  readonly price: ComparativePriceData;
  readonly depreciation: ComparativeDepreciationData;
  readonly revisionPlan: ComparativeRevisionPlanData;
  readonly specs: ReadonlyArray<ComparativeSpecData>;
  readonly equipments: ReadonlyArray<ComparativeEquipmentData>;
  readonly parts: ReadonlyArray<ComparativePartData>;
};

export type ComparativePriceData = {
  readonly price: number;
  readonly position: number;
};

export type ComparativeDepreciationData = {
  readonly sixMonthsPercentage: number;
  readonly position: number;
};

export type ComparativeRevisionPlanData = {
  readonly firstSixRevisionTotalPrice: string;
  readonly position: number;
};

export type ComparativePartData = {
  readonly part: {
    readonly id: string;
    readonly description: string;
  };
  readonly price: number;
  readonly position: number;
};

export type ComparativeEquipmentData = {
  readonly description: string;
  readonly itemStatus: string;
  readonly position: number;
};

export type ComparativeSpecData = {
  readonly specificationDescription: string;
  readonly value: number;
  readonly position: number;
};
