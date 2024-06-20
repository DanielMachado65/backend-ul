import { AccessoryVo } from 'src/domain/value-object/accessory.vo';
import { BasicVehicleDataCollection } from 'src/domain/value-object/basic-vechicle.vo';
import { RevisionVo } from 'src/domain/value-object/revision.vo';
import {
  QuerySpecialDatasheetVo,
  SpecialDataSheetParser,
  SpecialDatasheetVo,
} from 'src/infrastructure/service/query/parser/special-datasheet-parser';
import {
  mockAccessoryVo,
  mockBasicPackVo,
  mockBasicVehicleVo,
  mockDataSheetVo,
  mockRevisonVo,
} from 'src/infrastructure/service/query/test/parser/mocks/special-datasheet.mock';

describe(SpecialDataSheetParser.name, () => {
  test('should parse input to QuerySpecialDatasheetVo', () => {
    const fipeId1: number = 12345;
    const fipeId2: number = 34567;

    const fipeDataCollection: ReadonlyArray<BasicVehicleDataCollection> = [
      {
        fipeId: fipeId1?.toString(),
        versionId: 21345,
      },
      {
        fipeId: fipeId2?.toString(),
        versionId: 567895,
      },
    ];
    const accessories: ReadonlyArray<AccessoryVo> = [
      {
        fipeId: fipeId1,
        acessoryCategories: null,
        records: [
          {
            description: 'description_1',
            isSeries: true,
          },
        ],
      },
      {
        fipeId: fipeId2,
        acessoryCategories: null,
        records: [
          {
            description: 'description_2',
            isSeries: false,
          },
        ],
      },
    ];

    const revision: ReadonlyArray<RevisionVo> = mockRevisonVo();

    const input: SpecialDatasheetVo = {
      accessories,
      basicPack: mockBasicPackVo(),
      basicVehicle: { ...mockBasicVehicleVo(), dataCollection: fipeDataCollection },
      datasheet: mockDataSheetVo(),
      revision,
    };

    const result: QuerySpecialDatasheetVo = SpecialDataSheetParser.parse(input);

    expect(result).toStrictEqual({
      acessorios: {
        veiculosFipe: [
          {
            fipeId: fipeDataCollection[0].fipeId.toString(),
            idVersao: fipeDataCollection[0].versionId.toString(),
            registros: [
              {
                descricao: accessories[0].records[0].description,
                itemDeSerie: accessories[0].records[0].isSeries,
              },
            ],
          },
          {
            fipeId: fipeDataCollection[1].fipeId.toString(),
            idVersao: fipeDataCollection[1].versionId.toString(),
            registros: [
              {
                descricao: accessories[1].records[0].description,
                itemDeSerie: accessories[1].records[0].isSeries,
              },
            ],
          },
        ],
      },
      cestaBasica: {
        veiculosFipe: [
          {
            fipeId: 12345,
            registros: [
              {
                IdApelido: 11,
                apelidoDescricao: 'nickname_description 1',
                aposDescricaoFabricante: 'aftermarket_maker_description 1',
                complemento: 'complement 1',
                genuina: true,
                numeroPeca: 'part_number 1',
                valor: 123,
              },
              {
                IdApelido: 1321,
                apelidoDescricao: 'nickname_description 2',
                aposDescricaoFabricante: 'aftermarket_maker_description 2',
                complemento: 'complement 2',
                genuina: false,
                numeroPeca: 'part_number 2',
                valor: 321321,
              },
            ],
          },
        ],
        registros: [
          {
            IdApelido: 11,
            apelidoDescricao: 'nickname_description 1',
            aposDescricaoFabricante: 'aftermarket_maker_description 1',
            complemento: 'complement 1',
            genuina: true,
            numeroPeca: 'part_number 1',
            valor: 123,
          },
          {
            IdApelido: 1321,
            apelidoDescricao: 'nickname_description 2',
            aposDescricaoFabricante: 'aftermarket_maker_description 2',
            complemento: 'complement 2',
            genuina: false,
            numeroPeca: 'part_number 2',
            valor: 321321,
          },
        ],
      },
      dadosBasicosDoVeiculo: {
        anoFabricacao: 2021,
        anoModelo: 2022,
        caixaCambio: 'gear_box_number',
        capMaxTracao: '432243',
        capacidadeCarga: 5,
        capacidadePassageiro: 5,
        chassi: 'chassis',
        cilindradas: 432432,
        codigoFipe: 123,
        combustivel: 'fuel',
        descricao: 'model',
        eixos: 123,
        especieVeiculo: 'species',
        informacoesFipe: [
          {
            ano: 2022,
            combustivel: 'fuel',
            fipeId: '213',
            historicoPreco: [
              {
                ano: 2022,
                mes: 12,
                predicao: false,
                valor: (123123 / 100).toFixed(2),
              },
            ],
            marca: 'brand',
            modelo: 'model',
            valorAtual: (3213122311 / 100).toFixed(2),
            versao: 'version',
          },
        ],
        informacoesGerais: [
          {
            fipeId: '213',
            marca: 'brand',
            modelo: 'model',
            versao: 'version',
          },
        ],
        marca: 'model',
        nacional: 'Nacional',
        numCarroceria: 'body_number',
        numMotor: 'engine_number',
        numeroEixosAuxiliar: 'aux_axis_count',
        numeroEixosTraseiro: 'back_axis_count',
        pbt: '34423324',
        placa: 'plate',
        potencia: 12312,
        tipoVeiculo: 'type',
      },
      fichaTecnica: {
        veiculosFipe: [
          {
            fipeId: 12345,
            registros: [
              {
                descricao: 'description 1',
                especificacoes: [
                  {
                    propriedade: 'property 1',
                    valor: 'value 1',
                  },
                  {
                    propriedade: 'property 2',
                    valor: 'value 2',
                  },
                ],
              },
              {
                descricao: 'description 2',
                especificacoes: [
                  {
                    propriedade: 'property 3',
                    valor: 'value 3',
                  },
                  {
                    propriedade: 'property 4',
                    valor: 'value 4',
                  },
                ],
              },
            ],
          },
        ],
        registros: [
          {
            descricao: 'description 1',
            especificacoes: [
              {
                propriedade: 'property 1',
                valor: 'value 1',
              },
              {
                propriedade: 'property 2',
                valor: 'value 2',
              },
            ],
          },
          {
            descricao: 'description 2',
            especificacoes: [
              {
                propriedade: 'property 3',
                valor: 'value 3',
              },
              {
                propriedade: 'property 4',
                valor: 'value 4',
              },
            ],
          },
        ],
      },
      revisao: {
        veiculosFipe: [
          {
            fipeId: revision[0].fipeId.toString(),
            idVersao: revision[0].versionId.toString(),
            registros: [
              {
                duracaoEmMinutos: 100,
                inspecoes: ['aaaa', 'bbbb'],
                kilometragem: 100232,
                meses: 9,
                parcelas: 19,
                pecasTrocadas: [
                  {
                    descricao: 'description 1',
                    quantidade: 321,
                  },
                ],
                precoParcela: 10333,
                precoTotal: 1031323,
              },
              {
                duracaoEmMinutos: 32,
                inspecoes: ['cccc', 'dddd'],
                kilometragem: 32311,
                meses: 3,
                parcelas: 1,
                pecasTrocadas: [
                  {
                    descricao: 'description 2',
                    quantidade: 3,
                  },
                ],
                precoParcela: 4343,
                precoTotal: 3545,
              },
            ],
          },
        ],
      },
    });
  });
  test('should return accessories null if basic vehicle is null', () => {
    const input: SpecialDatasheetVo = {
      accessories: mockAccessoryVo(),
      basicPack: mockBasicPackVo(),
      basicVehicle: null,
      datasheet: mockDataSheetVo(),
      revision: mockRevisonVo(),
    };

    const result: QuerySpecialDatasheetVo = SpecialDataSheetParser.parse(input);

    expect(result).toStrictEqual({
      acessorios: null,
      dadosBasicosDoVeiculo: null,
      revisao: {
        veiculosFipe: [
          {
            fipeId: '12345',
            idVersao: '11111',
            registros: [
              {
                duracaoEmMinutos: 100,
                inspecoes: ['aaaa', 'bbbb'],
                kilometragem: 100232,
                meses: 9,
                parcelas: 19,
                pecasTrocadas: [
                  {
                    descricao: 'description 1',
                    quantidade: 321,
                  },
                ],
                precoParcela: 10333,
                precoTotal: 1031323,
              },
              {
                duracaoEmMinutos: 32,
                inspecoes: ['cccc', 'dddd'],
                kilometragem: 32311,
                meses: 3,
                parcelas: 1,
                pecasTrocadas: [
                  {
                    descricao: 'description 2',
                    quantidade: 3,
                  },
                ],
                precoParcela: 4343,
                precoTotal: 3545,
              },
            ],
          },
        ],
      },

      cestaBasica: {
        veiculosFipe: [
          {
            fipeId: 12345,
            registros: [
              {
                IdApelido: 11,
                apelidoDescricao: 'nickname_description 1',
                aposDescricaoFabricante: 'aftermarket_maker_description 1',
                complemento: 'complement 1',
                genuina: true,
                numeroPeca: 'part_number 1',
                valor: 123,
              },
              {
                IdApelido: 1321,
                apelidoDescricao: 'nickname_description 2',
                aposDescricaoFabricante: 'aftermarket_maker_description 2',
                complemento: 'complement 2',
                genuina: false,
                numeroPeca: 'part_number 2',
                valor: 321321,
              },
            ],
          },
        ],
        registros: [
          {
            IdApelido: 11,
            apelidoDescricao: 'nickname_description 1',
            aposDescricaoFabricante: 'aftermarket_maker_description 1',
            complemento: 'complement 1',
            genuina: true,
            numeroPeca: 'part_number 1',
            valor: 123,
          },
          {
            IdApelido: 1321,
            apelidoDescricao: 'nickname_description 2',
            aposDescricaoFabricante: 'aftermarket_maker_description 2',
            complemento: 'complement 2',
            genuina: false,
            numeroPeca: 'part_number 2',
            valor: 321321,
          },
        ],
      },
      fichaTecnica: {
        veiculosFipe: [
          {
            fipeId: 12345,
            registros: [
              {
                descricao: 'description 1',
                especificacoes: [
                  {
                    propriedade: 'property 1',
                    valor: 'value 1',
                  },
                  {
                    propriedade: 'property 2',
                    valor: 'value 2',
                  },
                ],
              },
              {
                descricao: 'description 2',
                especificacoes: [
                  {
                    propriedade: 'property 3',
                    valor: 'value 3',
                  },
                  {
                    propriedade: 'property 4',
                    valor: 'value 4',
                  },
                ],
              },
            ],
          },
        ],
        registros: [
          {
            descricao: 'description 1',
            especificacoes: [
              {
                propriedade: 'property 1',
                valor: 'value 1',
              },
              {
                propriedade: 'property 2',
                valor: 'value 2',
              },
            ],
          },
          {
            descricao: 'description 2',
            especificacoes: [
              {
                propriedade: 'property 3',
                valor: 'value 3',
              },
              {
                propriedade: 'property 4',
                valor: 'value 4',
              },
            ],
          },
        ],
      },
    });
  });

  test('should parse input to QuerySpecialDatasheetVo with all fields', () => {
    const input: SpecialDatasheetVo = {
      accessories: null,
      basicPack: null,
      basicVehicle: null,
      datasheet: null,
      revision: null,
    };

    const result: QuerySpecialDatasheetVo = SpecialDataSheetParser.parse(input);

    expect(result).toStrictEqual({
      acessorios: null,
      dadosBasicosDoVeiculo: null,
      revisao: {
        veiculosFipe: [],
      },

      cestaBasica: {
        veiculosFipe: [],
        registros: [],
      },
      fichaTecnica: {
        veiculosFipe: [],
        registros: [],
      },
    });
  });
});
