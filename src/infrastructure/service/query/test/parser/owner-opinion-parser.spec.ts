import { OwnerOpinionVo } from 'src/domain/value-object/owner-opinion.vo';
import { QueryOwnerOpinionVo } from 'src/domain/value-object/query/query-owner-opinion.vo';
import { OwnerOpinionParser } from 'src/infrastructure/service/query/parser/owner-opinion-parser';

const mockOwnerOpinionVo = (): OwnerOpinionVo => ({
  comfort: 1,
  cambium: 2,
  cityConsumption: 3,
  roadConsumption: 4,
  performance: 5,
  drivability: 6,
  internalSpace: 7,
  stability: 8,
  brakes: 9,
  trunk: 10,
  suspension: 9.9,
  costBenefit: 8.8,
  totalScore: 7.7,
});

describe(OwnerOpinionParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: Partial<QueryOwnerOpinionVo> = OwnerOpinionParser.parse(null);
    expect(result).toStrictEqual({ score: null });

    const result2: Partial<QueryOwnerOpinionVo> = OwnerOpinionParser.parse(undefined);
    expect(result2).toStrictEqual({ score: null });
  });

  test('should parse input to QueryOwnerOpinionVo', () => {
    const ownerOpinion: OwnerOpinionVo = mockOwnerOpinionVo();

    const result: QueryOwnerOpinionVo = OwnerOpinionParser.parse(ownerOpinion);

    expect(result).toStrictEqual({
      score: {
        conforto: 1,
        cambio: 2,
        consumoNaCidade: 3,
        consumoNaEstrada: 4,
        performance: 5,
        dirigibilidade: 6,
        espacoInterno: 7,
        estabilidade: 8,
        freios: 9,
        portaMalas: 10,
        suspensao: 9.9,
        custoBeneficio: 8.8,
        totalScore: 7.7,
      },
    });
  });
  test('should parse input to QueryOwnerOpinionVo with all fields null', () => {
    const ownerOpinion: OwnerOpinionVo = {
      comfort: null,
      cambium: null,
      cityConsumption: null,
      roadConsumption: null,
      performance: null,
      drivability: null,
      internalSpace: null,
      stability: null,
      brakes: null,
      trunk: null,
      suspension: null,
      costBenefit: null,
      totalScore: null,
    };

    const result: QueryOwnerOpinionVo = OwnerOpinionParser.parse(ownerOpinion);

    expect(result).toStrictEqual({
      score: {
        conforto: null,
        cambio: null,
        consumoNaCidade: null,
        consumoNaEstrada: null,
        performance: null,
        dirigibilidade: null,
        espacoInterno: null,
        estabilidade: null,
        freios: null,
        portaMalas: null,
        suspensao: null,
        custoBeneficio: null,
        totalScore: null,
      },
    });
  });
});
