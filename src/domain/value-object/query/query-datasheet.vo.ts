export type QueryDatasheetVo = {
  readonly veiculosFipe: ReadonlyArray<QueryDatasheetFipeVehicle>; // TODO - ver se é usado
  readonly registros: ReadonlyArray<QueryDatasheetRecord>;
};

export type QueryDatasheetFipeVehicle = {
  readonly fipeId: number;
  readonly registros: ReadonlyArray<QueryDatasheetRecord>;
};

export type QueryDatasheetRecord = {
  readonly descricao: string;
  readonly especificacoes: ReadonlyArray<QueryDatasheetRecordSpec>;
};

export type QueryDatasheetRecordSpec = {
  readonly propriedade: string;
  readonly valor: string;
};
