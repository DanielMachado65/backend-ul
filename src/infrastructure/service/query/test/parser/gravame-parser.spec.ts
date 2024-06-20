import { GravameVo } from 'src/domain/value-object/gravame.vo';
import { QueryGravameVo } from 'src/domain/value-object/query/query-gravame.vo';
import { GravameParser } from 'src/infrastructure/service/query/parser/gravame-parser';

const mockGravameVo = (): GravameVo => ({
  municipality: 'any_municipality',
  agent: 'any_agent',
  manufactureYear: 'any_manufacture_year',
  modelYear: 'any_model_year',
  chassis: 'any_chassis',
  agentCode: 'any_agent_code',
  contract: 'any_contract',
  issuanceDate: '01/01/2023',
  inclusionDate: '01/01/2023',
  agentDocument: 'any_agent_document',
  financedDocument: 'any_financed_document',
  responsible: 'any_responsible',
  number: 'any_number',
  observations: 'any_observations',
  plate: 'any_plate',
  uf: 'any_uf',
  ufPlate: 'any_uf_plate',
  contractEffectiveDate: 'any_contract_effective_date',
  renavam: 'any_renavam',
  situation: 'any_situation',
});

describe(GravameParser.name, () => {
  test('should return empty array if input is null or undefined', () => {
    const result: ReadonlyArray<QueryGravameVo> = GravameParser.parse(null);
    expect(result).toStrictEqual([]);

    const result2: ReadonlyArray<QueryGravameVo> = GravameParser.parse(undefined);
    expect(result2).toStrictEqual([]);
  });

  test('should parse input to QueryGravameVo', () => {
    const gravame: GravameVo = mockGravameVo();

    const result: ReadonlyArray<QueryGravameVo> = GravameParser.parse([gravame]);

    expect(result).toStrictEqual([
      {
        agente: gravame.agent,
        anoFabricacao: gravame.manufactureYear,
        anoModelo: gravame.modelYear,
        chassi: gravame.chassis,
        codigoAgente: gravame.agentCode,
        contrato: gravame.contract,
        dataEmissao: gravame.issuanceDate,
        dataInclusao: gravame.inclusionDate,
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
      },
    ]);
  });
  test('should parse input to QueryGravameVo with all fields null', () => {
    const gravame: GravameVo = {
      municipality: null,
      agent: null,
      manufactureYear: null,
      modelYear: null,
      chassis: null,
      agentCode: null,
      contract: null,
      issuanceDate: null,
      inclusionDate: null,
      agentDocument: null,
      financedDocument: null,
      responsible: null,
      number: null,
      observations: null,
      plate: null,
      uf: null,
      ufPlate: null,
      contractEffectiveDate: null,
      renavam: null,
      situation: null,
    };
    const result: ReadonlyArray<QueryGravameVo> = GravameParser.parse([gravame]);

    expect(result).toStrictEqual([
      {
        agente: null,
        anoFabricacao: null,
        anoModelo: null,
        chassi: null,
        codigoAgente: null,
        contrato: null,
        dataEmissao: null,
        dataInclusao: null,
        documentoFinanciado: null,
        documentoAgente: null,
        municipio: null,
        numero: null,
        observacoes: null,
        placa: null,
        renavam: null,
        responsavel: null,
        situacao: null,
        uf: null,
        ufPlaca: null,
      },
    ]);
  });
});
