export type QueryVehicleOwnersVo = {
  readonly primeiroRegistro: string;
  readonly ultimoRegistro: string;
  readonly total: number;
  readonly quantidadePf: number;
  readonly quantidadePJ: number;
  readonly ufs: ReadonlyArray<string>;
};
