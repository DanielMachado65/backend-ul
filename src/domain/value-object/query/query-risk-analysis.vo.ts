export type QueryRiskAnalysisVo = {
  readonly indiceRisco: string;
  readonly parecer: string;
  readonly imageLink?: string;
};

export enum QueryRiskAnalysisEnum {
  HIGH_RISK = 3,
  MIDDLE_RISK = 2,
  LOW_RISK = 1,
}
