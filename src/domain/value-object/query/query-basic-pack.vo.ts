export type QueryBasicPackVo = {
  readonly registros: ReadonlyArray<QueryBasicPackRecord>;
  readonly veiculosFipe: ReadonlyArray<QueryBasicPackFipeVehicle>;
};

export type QueryBasicPackFipeVehicle = {
  readonly fipeId: number;
  readonly registros: ReadonlyArray<QueryBasicPackRecord>;
};

export type QueryBasicPackRecord = {
  readonly IdApelido: number;
  readonly apelidoDescricao: string;
  readonly complemento: string;
  readonly numeroPeca: string;
  readonly genuina: boolean;
  readonly valor: number;
  readonly aposDescricaoFabricante: string;
};
