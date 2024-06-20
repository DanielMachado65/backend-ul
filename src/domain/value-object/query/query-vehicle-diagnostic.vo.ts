export type QueryVehicleDiagnosticVo = {
  readonly especifico: {
    readonly diagnostico: ReadonlyArray<QueryVehicleDiagnosticSpecificData>;
  };
  readonly generico: QueryVehicleDiagnosticGenericData;
};

export type QueryVehicleDiagnosticSpecificData = {
  readonly dataHora: string;
  readonly odometro: number;
  readonly listaFalhas: ReadonlyArray<QueryVehicleDiagnosticCrashListData>;
  readonly parametros: ReadonlyArray<QuerySpecificParameterData>;
};

type QueryVehicleDiagnosticGenericData = {
  readonly listaFalhas: ReadonlyArray<QueryVehicleDiagnosticCrashListData>;
};

export type QueryVehicleDiagnosticCrashListData = {
  readonly descricao: string;
  readonly solucao: ReadonlyArray<QuerySolutionsDiagnosticData>;
  readonly ocorrencias: number;
  readonly totalDiagnosticos: number;
  readonly porcentagemOcorrida: string;
  readonly dtc: string;
};

export type QuerySolutionsDiagnosticData = {
  readonly descricao: string;
};

export type QuerySpecificParameterData = {
  readonly descricao: string;
  readonly valor: string;
  readonly unidade: string;
};
