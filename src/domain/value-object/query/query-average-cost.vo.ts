export type QueryAverageCostEach10KData = {
  readonly de: number;
  readonly para: number;
  readonly mediaPlanoRevisao: number;
  readonly mediaDesgastePecas: number;
};

export type QueryAverageCostVo = {
  readonly custoTotal: number;
  readonly custoDesgastePecasTotal: number;
  readonly custoPlanoRevisaoTotal: number;
  readonly custoCada10k: ReadonlyArray<QueryAverageCostEach10KData>;
};
