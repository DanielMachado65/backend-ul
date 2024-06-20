export type QueryRevisionVo = {
  readonly veiculosFipe: ReadonlyArray<QueryRevisionFipeVehicleData>;
};

export type QueryRevisionFipeVehicleData = {
  readonly fipeId: string;
  readonly idVersao: string;
  readonly registros: ReadonlyArray<QueryRevisionFipeVehicleRecord>;
};

export type QueryRevisionFipeVehicleRecord = {
  readonly kilometragem: number;
  readonly meses: number;
  readonly parcelas: number;
  readonly duracaoEmMinutos: number;
  readonly precoTotal: number;
  readonly precoParcela: number;
  readonly pecasTrocadas: ReadonlyArray<QueryRevisionFipeVehicleChangedPartData>;
  readonly inspecoes: ReadonlyArray<string>;
};

export type QueryRevisionFipeVehicleChangedPartData = {
  readonly descricao: string;
  readonly quantidade: number;
};
