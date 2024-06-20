import { GravameVo } from 'src/domain/value-object/gravame.vo';
import { QueryGravameVo } from 'src/domain/value-object/query/query-gravame.vo';

export class GravameParser {
  static parse(gravames: ReadonlyArray<GravameVo>): ReadonlyArray<QueryGravameVo> {
    if (!Array.isArray(gravames)) return [];

    return gravames.map((gravame: GravameVo) => ({
      agente: gravame.agent,
      anoFabricacao: gravame.manufactureYear,
      anoModelo: gravame.modelYear,
      chassi: gravame.chassis,
      codigoAgente: gravame.agentCode,
      contrato: gravame.contract,
      dataEmissao: gravame.issuanceDate ?? null,
      dataInclusao: gravame.inclusionDate ?? null,
      documentoFinanciado: gravame.financedDocument,
      documentoAgente: gravame.agentDocument,
      municipio: gravame.municipality,
      numero: gravame.number,
      observacoes: gravame.observations,
      placa: gravame.plate,
      renavam: gravame.renavam,
      responsavel: gravame.responsible,
      situacao: gravame.situation,
      uf: gravame.uf,
      ufPlaca: gravame.ufPlate,
    }));
  }
}
