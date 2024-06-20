export type RevisionPlanItemDto = {
  readonly kilometers: number;
  readonly months: number;
  readonly fullPrice: number;
};

export type RevisionPlanNotifyDto = {
  readonly estimatedRevisionDate: Date;
  readonly estimatedKilometersRevision?: number;
  readonly estimatedFullPrice?: number;
  readonly fullPriceFormat?: string;
};

export type RevisionPlanDto = {
  readonly revisions: ReadonlyArray<RevisionPlanItemDto>;
};
