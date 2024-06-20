type ScoreReason = {
  readonly code?: string;
  readonly message?: string;
};

export type PersonScoreVo = {
  readonly score?: number;
  readonly reasonCode1?: ScoreReason;
  readonly reasonCode2?: ScoreReason;
  readonly reasonCode3?: ScoreReason;
  readonly reasonCode4?: ScoreReason;
  readonly paymentCommitmentScore?: number;
  readonly profileScore?: number;
  readonly creditRisk?: string;
  readonly creditRiskMessage?: string;
  readonly paymentProbability: string;
  readonly paymentProbabilityMessage: string;
};
