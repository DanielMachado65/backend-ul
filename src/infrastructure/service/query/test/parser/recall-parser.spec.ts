import { QueryRecallVo } from 'src/domain/value-object/query/query-recall.vo';
import { RecallVo } from 'src/domain/value-object/recall.vo';
import { RecallParser } from 'src/infrastructure/service/query/parser/recall-parser';

const mockRecallVo = (): RecallVo => ({
  brand: 'any_brand',
  chassis: 'any_chassis',
  details: [
    {
      campaignStartDate: new Date().toLocaleDateString('pt-BR'),
      defect: 'any_defect',
      fullDescription: 'any_full_description',
      risk: 'any_risk',
    },
  ],
  model: 'any_model',
  modelYear: 2023,
  pendingRecalls: [
    {
      description: 'any_pending_recall_description',
      identifier: 'any_identifier',
      recordDate: new Date().toLocaleDateString('pt-BR'),
      situation: 'any_situation',
    },
  ],
  returnDescription: 'any_return_descritption',
});

describe(RecallParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: Partial<QueryRecallVo> = RecallParser.parse(null);
    expect(result).toBe(null);

    const result2: Partial<QueryRecallVo> = RecallParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryRecallVo', () => {
    const recall: RecallVo = mockRecallVo();

    const result: QueryRecallVo = RecallParser.parse(recall);

    expect(result).toStrictEqual({
      anoModelo: '2023',
      chassi: 'any_chassis',
      descricaoRetorno: 'any_return_descritption',
      detalhes: [
        {
          dataInicioCampanha: recall.details[0].campaignStartDate.toLocaleString(),
          defeito: 'any_defect',
          descricaoCompleta: 'any_full_description',
          risco: 'any_risk',
          codigoProcon: null,
          gravidade: null,
          sujeitoConfirmacaoPelaMontadora: null,
          telefoneConfirmacao: null,
        },
      ],
      marca: 'any_brand',
      modelo: 'any_model',
      recallsPendente: [
        {
          descricao: 'any_pending_recall_description',
          identificador: 'any_identifier',
          dataDoRegistro: recall.pendingRecalls[0].recordDate.toLocaleString(),
          situacao: 'any_situation',
        },
      ],
    });
  });

  test('should parse input to QueryRecallVo with all fields null', () => {
    const recall: RecallVo = {
      brand: null,
      chassis: null,
      details: null,
      model: null,
      modelYear: null,
      pendingRecalls: null,
      returnDescription: null,
    };

    const result: QueryRecallVo = RecallParser.parse(recall);

    expect(result).toStrictEqual({
      anoModelo: null,
      chassi: null,
      descricaoRetorno: null,
      detalhes: undefined,
      marca: null,
      modelo: null,
      recallsPendente: undefined,
    });
  });

  test('should parse input to QueryRecallVo with details fields and pendingRecalls fields null', () => {
    const recall: RecallVo = {
      brand: null,
      chassis: null,
      details: [
        {
          campaignStartDate: null,
          defect: null,
          fullDescription: null,
          risk: null,
        },
      ],
      model: null,
      modelYear: null,
      pendingRecalls: [
        {
          description: null,
          identifier: null,
          recordDate: null,
          situation: null,
        },
      ],
      returnDescription: null,
    };

    const result: QueryRecallVo = RecallParser.parse(recall);

    expect(result).toStrictEqual({
      anoModelo: null,
      chassi: null,
      descricaoRetorno: null,
      detalhes: [
        {
          codigoProcon: null,
          dataInicioCampanha: null,
          defeito: null,
          descricaoCompleta: null,
          gravidade: null,
          risco: null,
          sujeitoConfirmacaoPelaMontadora: null,
          telefoneConfirmacao: null,
        },
      ],
      marca: null,
      modelo: null,
      recallsPendente: [
        {
          dataDoRegistro: null,
          descricao: null,
          identificador: null,
          situacao: null,
        },
      ],
    });
  });
});
