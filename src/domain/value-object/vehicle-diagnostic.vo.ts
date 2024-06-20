export type VehicleDiagnosticVo = {
  readonly specific: ReadonlyArray<SpecificDiagnosticData>;
  readonly generic: ReadonlyArray<VehicleDiagnosticCrashListData>;
};

export type SpecificDiagnosticData = {
  readonly dateTime: string;
  readonly brand: string;
  readonly vehicle: string;
  readonly odometer: number;
  readonly parameters: ReadonlyArray<SpecificParameterData>;
  readonly system: string;
  readonly crashList: ReadonlyArray<VehicleDiagnosticCrashListData>;
  readonly model: string;
  readonly chassis: string;
  readonly year: number;
};

export type SpecificParameterData = {
  readonly description: string;
  readonly value: string;
  readonly unit: string;
};

export type VehicleDiagnosticCrashListData = {
  readonly description: string;
  readonly occurrences: number;
  readonly solutions: ReadonlyArray<VehicleDiagnosticSolution>;
  readonly totalDiagnostics: number;
  readonly occurrencesPercentage: string;
  readonly dtc: string;
};

export type VehicleDiagnosticSolution = {
  readonly description: string;
};
