export type CompanyScoreVo = {
  readonly creditRisk: string;
  readonly creditRiskMessage: string;
  readonly paymentProbability: string;
  readonly paymentProbabilityMessage: string;
  readonly reasonCode1: string;
  readonly reasonCode1Message: string;
  readonly score?: number;
};
