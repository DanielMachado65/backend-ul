export type QueryRecallVo = {
  readonly anoModelo: string;
  readonly chassi: string;
  readonly descricaoRetorno: string;
  readonly detalhes: ReadonlyArray<QueryRecallDetails>;
  readonly marca: string;
  readonly modelo: string;
  readonly recallsPendente: ReadonlyArray<QueryPendingRecalls>;
};

export type QueryRecallDetails = {
  readonly codigoProcon: string;
  readonly dataInicioCampanha: string;
  readonly defeito: string;
  readonly descricaoCompleta: string;
  readonly gravidade: string;
  readonly risco: string;
  readonly sujeitoConfirmacaoPelaMontadora: string;
  readonly telefoneConfirmacao: string;
};

export type QueryPendingRecalls = {
  readonly descricao: string;
  readonly dataDoRegistro: string;
  readonly identificador: string;
  readonly situacao: string;
};
