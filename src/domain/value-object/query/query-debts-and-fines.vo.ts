export type QueryDebtsAndFinesVo = {
  readonly invalidState: boolean;
  readonly noDebts: boolean;
  readonly noVehicle: boolean;
  readonly protocolo?: string;
  readonly debitos: ReadonlyArray<QueryDebts>;
};

export type QueryDebts = {
  readonly tipo: string;
  readonly valorTotalEmCentavos: number;
  readonly registros: ReadonlyArray<QueryDebsAndFinesRecords>;
};

export type QueryDebsAndFinesRecords = {
  readonly idExterno: string;
  readonly tipo: string;
  readonly protocolo: string;
  readonly titulo: string;
  readonly descricao: string;
  readonly valorEmCentavos: number;
  readonly dataDeExpiracao: Date;
  readonly dataDeCriacao: Date;
  readonly obrigatorio: boolean;
  readonly distinguirDe: ReadonlyArray<string>;
  readonly dependeDe: ReadonlyArray<string>;
};
