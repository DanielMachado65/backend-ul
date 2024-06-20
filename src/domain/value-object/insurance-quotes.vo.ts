export type InsuranceQuoteCoverage = {
  readonly kind: string;
  readonly priceCents: number;
};

export class InsuranceQuotesVo {
  fipeId: string;
  model: string;
  modelYear: number;
  coverages: ReadonlyArray<InsuranceQuoteCoverage>;
}
