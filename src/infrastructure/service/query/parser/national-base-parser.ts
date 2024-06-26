import { NationalBaseVo } from 'src/domain/value-object/national-base.vo';
import { QueryNationalBaseVo } from 'src/domain/value-object/query/query-national-base.vo';

export class NationalBaseParser {
  static parse(nationalBase: NationalBaseVo): Partial<QueryNationalBaseVo> {
    if (nationalBase === null || nationalBase === undefined) return null;
    return {
      placa: nationalBase?.plate,
      anoFabricacao: nationalBase?.manufactureYear?.toString(),
      anoModelo: nationalBase?.modelYear?.toString(),
      categoria: nationalBase?.category,
      chassi: nationalBase?.chassis,
      combustivel: nationalBase?.fuel,
      cor: nationalBase?.color,
      di: nationalBase?.di,
      docFaturado: nationalBase?.docBilled,
      docProprietario: nationalBase?.ownerDoc,
      dtEmissaoCrv: null,
      dtUltimaAtualizacao: nationalBase?.lastUpdateDate?.toLocaleString(),
      especie: nationalBase?.species,
      especieVeiculo: nationalBase?.vehicleSpecie,
      indicadorComunicacaoVendas: nationalBase?.restrictions?.salesCommunication?.description,
      indicadorRestricaoRenajud: nationalBase?.restrictions?.restrictionsRenajud?.description,
      motor: nationalBase?.engineNumber,
      municipio: nationalBase?.city,
      ocorrencia: nationalBase?.restrictions?.occurrence?.description,
      outrasRestricoes1: nationalBase?.restrictions?.othersRestrictions1?.description,
      outrasRestricoes2: nationalBase?.restrictions?.othersRestrictions2?.description,
      outrasRestricoes3: nationalBase?.restrictions?.othersRestrictions3?.description,
      outrasRestricoes4: nationalBase?.restrictions?.othersRestrictions4?.description,
      outrasRestricoes5: nationalBase?.restrictions?.othersRestrictions5?.description,
      outrasRestricoes6: nationalBase?.restrictions?.othersRestrictions6?.description,
      outrasRestricoes7: nationalBase?.restrictions?.othersRestrictions7?.description,
      outrasRestricoes8: nationalBase?.restrictions?.othersRestrictions8?.description,
      renavam: nationalBase?.renavam,
      restricao1: nationalBase?.restrictions?.restriction1?.description,
      restricao2: nationalBase?.restrictions?.restriction2?.description,
      restricao3: nationalBase?.restrictions?.restriction3?.description,
      restricao4: nationalBase?.restrictions?.restriction4?.description,
      restricaoDataInclusao: nationalBase?.inclusionRestrictionDate?.toLocaleString(),
      restricaoFinanciadora: nationalBase?.restrictions?.restrictionsFinan?.description,
      restricaoFinanciamento: nationalBase?.restrictions?.restrictionsFinanced?.description,
      restricaoNomeAgente: nationalBase?.restrictions?.restrictionsAgentName?.description,
      restricaoTipoTransacao: nationalBase?.restrictions?.importation?.description,
      situacaoVeiculo: nationalBase?.vehicleSituation,
      tipoDocFaturado: nationalBase?.billedDocType,
      tipoDocImportadora: nationalBase?.importDocType,
      tipoMarcacaoChassi: nationalBase?.chassisBrandType,
      tipoVeiculo: nationalBase?.vehicleType,
      uf: nationalBase?.uf,
      ufFaturado: nationalBase?.ufBilled,
      procedencia: nationalBase?.provenance,
    };
  }
}
