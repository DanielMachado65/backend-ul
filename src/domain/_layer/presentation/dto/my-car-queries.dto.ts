import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MyCarQueryPriceFIPELastMonthsValuationDevaluation {
  @ApiProperty({ example: '+12.19%' })
  readonly '6months': string;

  @ApiProperty({ example: '+12.19%' })
  readonly '12months': string;
}

export class MyCarQueryPriceFIPELastYearsValuationDevaluation {
  @ApiProperty({ example: '2020' })
  period: string;

  @ApiProperty({ example: '+12.19%' })
  percent: string;
}

export class MyCarQueryPriceFIPEPriceLast6Months {
  @ApiProperty({ example: 'Jul/2022' })
  x: string;

  @ApiProperty({ example: 'R$ 20000.00' })
  y: string;
}

// Retornar em porcentagem
export class MyCarQueryPriceFIPE {
  @ApiProperty({ example: '+12.19%' })
  totalVariation: string;

  @ApiProperty({ example: 'RENAULT CLIO RL/ JP/AUTH.1.0/1.0 HI-POWER 16V 5P' })
  vehicleName: string;

  @ApiProperty()
  lastMonthsValuationDevaluation: MyCarQueryPriceFIPELastMonthsValuationDevaluation;

  @ApiProperty({ type: [MyCarQueryPriceFIPELastYearsValuationDevaluation] })
  lastYearsValuationDevaluation: ReadonlyArray<MyCarQueryPriceFIPELastYearsValuationDevaluation>;

  @ApiProperty({ type: [MyCarQueryPriceFIPEPriceLast6Months] })
  priceLast6Months: ReadonlyArray<MyCarQueryPriceFIPEPriceLast6Months>;
}

/** ------------------------------------------------------------------------------------------ */

export class MyCarQueryDatasheetInformation {
  @ApiProperty()
  property: string;

  @ApiProperty()
  value: string;
}

export class MyCarQueryDatasheet {
  @ApiProperty()
  version: string;

  @ApiProperty()
  fipeCode: string;

  @ApiProperty()
  currentValue: string;

  @ApiProperty()
  guarantee: string;

  @ApiProperty()
  maxVelocity: string;

  @ApiProperty()
  urbanConsumption: string;

  @ApiProperty()
  roadConsumption: string;

  /** Fields */
  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  transmission: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  consumption: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  performance: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  brake: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  suspension: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  steeringWheel: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  battery: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  lighting: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  lubricant: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  aerodynamics: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  motor: ReadonlyArray<MyCarQueryDatasheetInformation>;

  @ApiProperty({ type: [MyCarQueryDatasheetInformation] })
  dimensions: ReadonlyArray<MyCarQueryDatasheetInformation>;
}

/** ------------------------------------------------------------------------------------------ */

class MyCarQueryPartsAndValuesPart {
  @ApiProperty()
  part: string;

  @ApiProperty()
  complement: string;

  @ApiProperty()
  valueInCents: number;
}

export class MyCarQueryPartsAndValues {
  @ApiProperty({ type: [MyCarQueryPartsAndValuesPart] })
  parts: ReadonlyArray<MyCarQueryPartsAndValuesPart>;
}

/** ------------------------------------------------------------------------------------------ */

export class MyCarQueryFineDebts {
  @ApiProperty()
  isOverdue: boolean;

  @ApiProperty()
  info: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ example: new Date().toISOString() })
  emittedAt: string | null;

  @ApiProperty({ example: 'R$ 20000.00' })
  valor: string;
}

export class MyCarQueryFine {
  @ApiProperty({ example: 'R$ 20000.00' })
  totalValue: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ type: [MyCarQueryFineDebts] })
  debits: ReadonlyArray<MyCarQueryFineDebts>;
}

export class MyCarQueryFines {
  @ApiProperty({ example: 'R$ 20000.00' })
  totalValue: string; // cents?

  @ApiProperty({ type: [MyCarQueryFine] })
  fines: ReadonlyArray<MyCarQueryFine>;

  @ApiProperty({ example: 'https://partner.com/logo.png' })
  partnerLogo: string;

  @ApiProperty({ example: 'Partner information' })
  partnerDescription: string;
}

/** ------------------------------------------------------------------------------------------ */

export class MyCarQueryInsuranceQuoteCoverage {
  @ApiProperty()
  order: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isIncluded: boolean;

  @ApiProperty()
  type: string;

  @ApiProperty()
  priceInCents: number;
}

export class MyCarQueryInsuranceQuote {
  @ApiProperty()
  externalUrl: string;

  @ApiProperty()
  vehicleVersion: string;

  @ApiProperty({ type: [MyCarQueryInsuranceQuoteCoverage] })
  coverages: ReadonlyArray<MyCarQueryInsuranceQuoteCoverage>;
}

/** ------------------------------------------------------------------------------------------ */

class MyCarQueryMainModelFlaw {
  @ApiProperty()
  description: string;

  @ApiProperty()
  occurrencePercent: number;

  @ApiProperty()
  analysisCount: number;

  @ApiProperty()
  identifiedFlawsCount: number;

  @ApiProperty()
  solution: string;
}

export class MyCarQueryMainFlaws {
  @ApiProperty({ type: [MyCarQueryMainModelFlaw] })
  flaws: ReadonlyArray<MyCarQueryMainModelFlaw>;
}

/** ------------------------------------------------------------------------------------------ */

class MyCarQueryRevisionPlanRevisionPart {
  @ApiProperty()
  name: string;
}

class MyCarQueryRevisionPlanRevision {
  @ApiProperty()
  monthsToRevision: number;

  @ApiProperty()
  kmToRevision: number;

  @ApiProperty()
  totalPrice: string;

  @ApiProperty({ type: [MyCarQueryRevisionPlanRevisionPart] })
  partsToReplace: ReadonlyArray<MyCarQueryRevisionPlanRevisionPart>;

  @ApiProperty({ type: [MyCarQueryRevisionPlanRevisionPart] })
  partsToInspect: ReadonlyArray<MyCarQueryRevisionPlanRevisionPart>;
}

export class MyCarQueryRevisionPlan {
  @ApiProperty({ type: [MyCarQueryRevisionPlanRevision] })
  revisionPlans: ReadonlyArray<MyCarQueryRevisionPlanRevision>;
}

/** ------------------------------------------------------------------------------------------ */

class MyCarQueryOwnerReviewRankingField {
  @ApiProperty()
  property: string;

  @ApiProperty()
  rank: number;
}

class MyCarQueryOwnerReviewRanking {
  @ApiProperty({ type: [MyCarQueryOwnerReviewRankingField] })
  fields: ReadonlyArray<MyCarQueryOwnerReviewRankingField>;

  // @ApiProperty()
  // comfort: number;

  // @ApiProperty()
  // cambium: number;

  // @ApiProperty()
  // cityConsumption: number;

  // @ApiProperty()
  // roadConsumption: number;

  // @ApiProperty()
  // performance: number;

  // @ApiProperty()
  // drivability: number;

  // @ApiProperty()
  // internal_space: number;

  // @ApiProperty()
  // stability: number;

  // @ApiProperty()
  // brakes: number;

  // @ApiProperty()
  // trunk: number;

  // @ApiProperty()
  // suspension: number;

  // @ApiProperty()
  // costBenefit: number;

  @ApiProperty()
  totalScore: number;
}

class MyCarQueryOwnerReviewReview {
  @ApiProperty()
  name: string;

  @ApiProperty()
  km: number;

  @ApiProperty()
  cons: string; // Contras

  @ApiProperty()
  strengths: string; // Prós

  @ApiProperty()
  flaws: string; // Defeitos apresentados

  @ApiProperty()
  generalFeedback: string; // Opinião geral

  @ApiProperty({ example: new Date().toISOString() })
  reviewAt: string;

  @ApiProperty()
  ranking: MyCarQueryOwnerReviewRanking;
}

// TODO - Dados nao encontrados na consulta
export class MyCarQueryOwnerReview {
  @ApiProperty()
  rankingAverage: MyCarQueryOwnerReviewRanking;

  @ApiProperty({ type: [MyCarQueryOwnerReviewReview] })
  reviews: ReadonlyArray<MyCarQueryOwnerReviewReview>;
}
