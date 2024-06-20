export type VehicleVersion = { readonly fipeCode: string; readonly versionName: string };

export type VersionAbout = {
  // eslint-disable-next-line functional/prefer-readonly-type
  fipeCode: string;
  readonly modelYear: number;
  readonly brandName: string;
  readonly modelName: string;
  readonly versionName: string;
};

export abstract class VehicleVersionService {
  abstract getBrands(): Promise<ReadonlyArray<string>>;

  abstract getModels(brand: string): Promise<ReadonlyArray<string>>;

  abstract getModelYears(brand: string, model: string): Promise<ReadonlyArray<number>>;

  abstract getVersions(brand: string, model: string, year: number): Promise<ReadonlyArray<VehicleVersion>>;

  abstract getVersionAbout(fipeId: string, modelYear: number): Promise<VersionAbout>;

  abstract getMultipleVersionAbout(
    fipeIds: ReadonlyArray<string>,
    modelYear: number,
  ): Promise<ReadonlyArray<VersionAbout>>;

  abstract getAllPossibleVehicles(): Promise<ReadonlyArray<VersionAbout>>;
}
