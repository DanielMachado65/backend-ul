import { InsuranceQuoteCoverage, InsuranceQuotesVo } from 'src/domain/value-object/insurance-quotes.vo';

export const mockInsuranceQuotesVo = (params?: Partial<InsuranceQuotesVo>): InsuranceQuotesVo => {
  const fipeId: string = params.fipeId || Math.floor(Math.random() * 1000).toString();
  const coverages: ReadonlyArray<InsuranceQuoteCoverage> = params.coverages || [
    {
      kind: 'robbery_and_theft',
      priceCents: 12312,
    },
    {
      kind: 'unlimited_km',
      priceCents: 12312,
    },
    {
      kind: 'total_loss',
      priceCents: 12312,
    },
    {
      kind: 'partial_loss',
      priceCents: 12312,
    },
  ];

  return {
    fipeId,
    model: 'any_model',
    modelYear: 2021,
    coverages,
  };
};
