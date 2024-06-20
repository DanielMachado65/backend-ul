import { QueryRiskAnalysisEnum, QueryRiskAnalysisVo } from 'src/domain/value-object/query/query-risk-analysis.vo';
import { TechnicalAdviceVo } from 'src/domain/value-object/technical-advice.vo';

export class TechnicalAdviceParser {
  static parse(riskAnalysis: TechnicalAdviceVo): QueryRiskAnalysisVo {
    if (riskAnalysis === null || riskAnalysis === undefined) return null;
    const messages: Record<number, string> = {
      [QueryRiskAnalysisEnum.LOW_RISK]: 'Veículo com baixo risco de recusa em comercialização/seguro 😃',
      [QueryRiskAnalysisEnum.MIDDLE_RISK]: 'Veículo com médio risco de recusa em comercialização/seguro 😑',
      [QueryRiskAnalysisEnum.HIGH_RISK]: 'Veículo com alto risco de recusa em comercialização/seguro 😒',
    };

    return {
      indiceRisco: riskAnalysis?.technicalAdvice,
      parecer: messages[riskAnalysis?.technicalAdvice] || null,
      imageLink: riskAnalysis?.imageLink,
    };
  }
}
