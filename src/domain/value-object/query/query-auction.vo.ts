export type QueryAuctionVo = {
  readonly descricao: string;
  readonly registros: ReadonlyArray<QueryAuctionRecordData>;
  readonly score: QueryAuctionScoreVo;
};

export type QueryAuctionRecordData = {
  readonly anoFabricacao: string;
  readonly anoModelo: string;
  readonly chassi: string;
  readonly comitente: string;
  readonly condicaoGeral: string;
  readonly cor: string;
  readonly dataLeilao: string;
  readonly leiloeiro: string;
  readonly lote: string;
  readonly marca: string;
  readonly modelo: string;
  readonly placa: string;
  readonly observacao: string;
};

export type QueryAuctionScoreVo = {
  readonly aceitacao: string;
  readonly exigenciaVistoriaEspecial: string;
  readonly percentualSobreRef: string;
  readonly pontuacao: string;
  readonly score: string;
};
