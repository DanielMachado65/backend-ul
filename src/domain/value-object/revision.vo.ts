export type RevisionRecord = {
  readonly kilometers: number;
  readonly months: number;
  readonly parcels: number;
  readonly durationMinutes: number;
  readonly fullPrice: number;
  readonly parcelPrice: number;
  readonly changedParts: ReadonlyArray<RevisionChangedPartData>;
  readonly inspections: ReadonlyArray<string>;
};

export type RevisionChangedPartData = {
  readonly description: string;
  readonly amount: number;
};

export type RevisionVo = {
  readonly fipeId: number;
  readonly versionId: number;
  readonly year: number;
  readonly records: ReadonlyArray<RevisionRecord>;
};
