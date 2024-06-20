export type QueryAccessoryVo = {
  readonly veiculosFipe: ReadonlyArray<QueryAccessoryFipeVehicleData>;
};

export type QueryAccessoryFipeVehicleData = {
  readonly fipeId: string;
  readonly idVersao: string;
  readonly registros: ReadonlyArray<QueryAccessoryFipeVehicleRecord>;
};

export type QueryAccessoryFipeVehicleRecord = {
  readonly descricao: string;
  readonly itemDeSerie: boolean;
};
