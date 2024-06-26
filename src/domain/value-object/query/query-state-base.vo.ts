import { StringOrNull } from 'src/domain/types';

export type QueryStateBaseVo = {
  readonly placa: StringOrNull;
  readonly chassi: StringOrNull;
  readonly renavam: StringOrNull;
  readonly categoria: StringOrNull;
  readonly combustivel: StringOrNull;
  readonly comunicacaoInclusao: StringOrNull;
  readonly comunicacaoVenda: StringOrNull;
  readonly cor: StringOrNull;
  readonly dataEmissaoCrv: StringOrNull;
  readonly dataInclusaoIntencaoTrocaFinanceira: StringOrNull;
  readonly dataLimiteRestricaoTributaria: StringOrNull;
  readonly dataVenda: StringOrNull;
  readonly dataVigenciaContratoFinanceira: StringOrNull;
  readonly debitoCetesb: StringOrNull;
  readonly debitoDer: StringOrNull;
  readonly debitoDersa: StringOrNull;
  readonly debitoDetran: StringOrNull;
  readonly debitoDpvat: StringOrNull;
  readonly debitoIpva: StringOrNull;
  readonly debitoLicenciamento: StringOrNull;
  readonly debitoMultas: StringOrNull;
  readonly debitoMunicipais: StringOrNull;
  readonly debitoPoliciaRodoviariaFederal: StringOrNull;
  readonly debitoRenainf: StringOrNull;
  readonly especie: StringOrNull;
  readonly exercicioLicenciamento: StringOrNull;
  readonly existeDebitoDpvat: StringOrNull;
  readonly existeDebitoIpva: StringOrNull;
  readonly existeDebitoLicenciamento: StringOrNull;
  readonly existeDebitoMulta: StringOrNull;
  readonly intencaoDataInslusao: StringOrNull;
  readonly intencaoDocFinanceira: StringOrNull;
  readonly intencaoNomeFinanceira: StringOrNull;
  readonly intencaoRestricaoFinanceira: StringOrNull;
  readonly licdata: StringOrNull;
  readonly motor: StringOrNull;
  readonly observacoes: StringOrNull;
  readonly outrasRestricoes1: StringOrNull;
  readonly outrasRestricoes2: StringOrNull;
  readonly outrasRestricoes3: StringOrNull;
  readonly outrasRestricoes4: StringOrNull;
  readonly pronome: StringOrNull;
  readonly pronomeAnterior: StringOrNull;
  readonly restricaoAdminisrativa: StringOrNull;
  readonly restricaoAmbiental: StringOrNull;
  readonly restricaoArrendatario: StringOrNull;
  readonly restricaoDataInclusao: StringOrNull;
  readonly restricaoDocArrendatario: StringOrNull;
  readonly restricaoFinanceira: StringOrNull;
  readonly restricaoGuincho: StringOrNull;
  readonly restricaoJudicial: StringOrNull;
  readonly restricaoNomeAgente: StringOrNull;
  readonly restricaoRenajud: StringOrNull;
  readonly restricaoRouboFurto: StringOrNull;
  readonly restricaoTributaria: StringOrNull;
  readonly situacaoVeiculo: StringOrNull;
  readonly tipoMarcacaoChassi: StringOrNull;
  readonly uf: StringOrNull;
  readonly municipio: StringOrNull;
  readonly tipo: StringOrNull;
};
