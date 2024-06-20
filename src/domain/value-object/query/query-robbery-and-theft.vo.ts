export type QueryRobberyAndTheftVo = {
  readonly constaOcorrencia: boolean;
  readonly constaOcorrenciaAtiva: boolean;
  readonly indicadorProcedencia: string;
  readonly municipioEmplacamento: string;
  readonly historico: ReadonlyArray<QueryRobberyAndTheftHistoricData>;
};

export type QueryRobberyAndTheftHistoricData = {
  readonly chassi: string;
  readonly cor: string;
  readonly dataOcorrencia: string;
  readonly declaracao: string;
  readonly marcaModelo: string;
  readonly municipioOcorrencia: string;
  readonly ocorrencia: string;
  readonly placa: string;
  readonly boletim: string;
  readonly ufOcorrencia: string;
};
