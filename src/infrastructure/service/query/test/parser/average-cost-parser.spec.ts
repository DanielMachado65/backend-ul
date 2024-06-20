import { AverageCostEach10kData, AverageCostVo } from 'src/domain/value-object/average-cost.vo';
import { QueryAverageCostVo } from 'src/domain/value-object/query/query-average-cost.vo';
import { AverageCostParser } from 'src/infrastructure/service/query/parser/average-cost-parser';

const mockAverageCostVo = (): AverageCostVo => ({
  totalCost: 1000,
  totalCostRevisionPlan: 2321,
  totalCostWearParts: 231232,
  costEach10k: [
    {
      from: 1,
      to: 1000,
      revisionPlanAverage: 123312123,
      wearPartsAverage: 123321312,
    },
  ],
});

describe(AverageCostParser.name, () => {
  test('should return null if average cost is null or undefined ', () => {
    const result: QueryAverageCostVo = AverageCostParser.parse(null);
    const result2: QueryAverageCostVo = AverageCostParser.parse(undefined);

    expect(result).toStrictEqual(null);
    expect(result2).toStrictEqual(null);
  });

  test('should parser data to QueryAverageCostVo', () => {
    const averageCost: AverageCostVo = mockAverageCostVo();
    const result: QueryAverageCostVo = AverageCostParser.parse(averageCost);

    expect(result).toStrictEqual({
      custoTotal: averageCost?.totalCost,
      custoDesgastePecasTotal: averageCost?.totalCostWearParts,
      custoPlanoRevisaoTotal: averageCost?.totalCostRevisionPlan,
      custoCada10k: averageCost?.costEach10k?.map((data: AverageCostEach10kData) => ({
        de: data.from,
        para: data.to,
        mediaDesgastePecas: data.wearPartsAverage,
        mediaPlanoRevisao: data.revisionPlanAverage,
      })),
    });
  });
});
