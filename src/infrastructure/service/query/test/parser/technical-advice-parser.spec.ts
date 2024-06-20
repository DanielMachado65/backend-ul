import { QueryRiskAnalysisVo } from 'src/domain/value-object/query/query-risk-analysis.vo';
import { TechnicalAdviceVo } from 'src/domain/value-object/technical-advice.vo';
import { TechnicalAdviceParser } from 'src/infrastructure/service/query/parser/technical-advice-parser';

const mockTechnicalAdviceVo = (): TechnicalAdviceVo => ({
  imageLink: 'any_image_link',
  technicalAdvice: '1',
  trafficLight: 'any_traffic_light',
});

describe(TechnicalAdviceParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryRiskAnalysisVo = TechnicalAdviceParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryRiskAnalysisVo = TechnicalAdviceParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryRiskAnalysisVo', () => {
    const riskAnalysis: TechnicalAdviceVo = mockTechnicalAdviceVo();

    const result: QueryRiskAnalysisVo = TechnicalAdviceParser.parse(riskAnalysis);

    expect(result).toStrictEqual({
      indiceRisco: '1',
      parecer: 'Veículo com baixo risco de recusa em comercialização/seguro 😃',
      imageLink: 'any_image_link',
    });
  });

  test('should parse input to QueryRiskAnalysisVo with fields null', () => {
    const riskAnalysis: TechnicalAdviceVo = {
      imageLink: null,
      technicalAdvice: null,
      trafficLight: null,
    };

    const result: QueryRiskAnalysisVo = TechnicalAdviceParser.parse(riskAnalysis);

    expect(result).toStrictEqual({
      indiceRisco: null,
      parecer: null,
      imageLink: null,
    });
  });
});
