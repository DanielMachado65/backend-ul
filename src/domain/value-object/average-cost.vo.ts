import { NumberOrNull } from 'src/domain/types';

export type AverageCostEach10kData = {
  readonly from: NumberOrNull;
  readonly to: NumberOrNull;
  readonly revisionPlanAverage: NumberOrNull;
  readonly wearPartsAverage: NumberOrNull;
};

export type AverageCostVo = {
  readonly totalCost: NumberOrNull;
  readonly totalCostRevisionPlan: NumberOrNull;
  readonly totalCostWearParts: NumberOrNull;
  readonly costEach10k: ReadonlyArray<AverageCostEach10kData>;
};
