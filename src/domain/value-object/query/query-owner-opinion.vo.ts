export type QueryOwnerOpinionVo = {
  readonly score: QueryOwnerOpinionScoreData;
};

export type QueryOwnerOpinionScoreData = {
  readonly conforto: number | null;
  readonly cambio: number | null;
  readonly consumoNaCidade: number | null;
  readonly consumoNaEstrada: number | null;
  readonly performance: number | null;
  readonly dirigibilidade: number | null;
  readonly espacoInterno: number | null;
  readonly estabilidade: number | null;
  readonly freios: number | null;
  readonly portaMalas: number | null;
  readonly suspensao: number | null;
  readonly custoBeneficio: number | null;
  readonly totalScore: number | null;
};
