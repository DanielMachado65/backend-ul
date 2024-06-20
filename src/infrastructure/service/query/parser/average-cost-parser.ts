import { AverageCostEach10kData, AverageCostVo } from 'src/domain/value-object/average-cost.vo';
import { QueryAverageCostVo } from 'src/domain/value-object/query/query-average-cost.vo';

export class AverageCostParser {
  static parse(averageCost: AverageCostVo): QueryAverageCostVo {
    if (averageCost === null || averageCost === undefined) return null;
    return {
      custoTotal: averageCost?.totalCost,
      custoDesgastePecasTotal: averageCost?.totalCostWearParts,
      custoPlanoRevisaoTotal: averageCost?.totalCostRevisionPlan,
      custoCada10k: averageCost?.costEach10k?.map((data: AverageCostEach10kData) => ({
        de: data.from,
        para: data.to,
        mediaDesgastePecas: data.wearPartsAverage,
        mediaPlanoRevisao: data.revisionPlanAverage,
      })),
    };
  }
}
