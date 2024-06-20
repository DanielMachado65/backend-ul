export type QueryInsuranceQuoteVo = {
  readonly versoes: ReadonlyArray<QueryInsuranceQuoteVersion>;
};

export type QueryInsuranceQuoteVersion = {
  readonly codigoFipe: string;
  readonly anoModelo: number;
  readonly modelo: string;
  readonly versao: string;
  readonly coberturas: ReadonlyArray<QueryInsuranceQuoteCoverage>;
};

export type QueryInsuranceQuoteCoverage = {
  readonly tipoSeguro: string;
  readonly precoEmCentavos: string;
  readonly razoesDeRecusca: string;
};
