import { BasicPackVo } from 'src/domain/value-object/basic-pack.vo';
import { QueryBasicPackRecord, QueryBasicPackVo } from 'src/domain/value-object/query/query-basic-pack.vo';
import { BasicPackParser } from 'src/infrastructure/service/query/parser/basic-pack-parser';
import { mockBasicPackVo } from 'src/infrastructure/service/query/test/parser/mocks/special-datasheet.mock';

describe(BasicPackParser.name, () => {
  test('should return an empty array if input is not an array', () => {
    const result: QueryBasicPackVo = BasicPackParser.parse(null);
    expect(result).toStrictEqual({ registros: [], veiculosFipe: [] });

    const result2: QueryBasicPackVo = BasicPackParser.parse([]);
    expect(result2).toStrictEqual({ registros: [], veiculosFipe: [] });
  });

  test('should parse input to QueryBasicPackVo', () => {
    const basicPack: ReadonlyArray<BasicPackVo> = mockBasicPackVo();

    const result: QueryBasicPackVo = BasicPackParser.parse(basicPack);

    const records: ReadonlyArray<QueryBasicPackRecord> = [
      {
        IdApelido: basicPack[0].records[0].nicknameId,
        apelidoDescricao: basicPack[0].records[0].nicknameDescription,
        aposDescricaoFabricante: basicPack[0].records[0].aftermarketMakerDescription,
        complemento: basicPack[0].records[0].complement,
        genuina: basicPack[0].records[0].isGenuine,
        numeroPeca: basicPack[0].records[0].partNumber,
        valor: basicPack[0].records[0].value,
      },
      {
        IdApelido: basicPack[0].records[1].nicknameId,
        apelidoDescricao: basicPack[0].records[1].nicknameDescription,
        aposDescricaoFabricante: basicPack[0].records[1].aftermarketMakerDescription,
        complemento: basicPack[0].records[1].complement,
        genuina: basicPack[0].records[1].isGenuine,
        numeroPeca: basicPack[0].records[1].partNumber,
        valor: basicPack[0].records[1].value,
      },
    ];

    expect(result).toStrictEqual({
      veiculosFipe: [
        {
          fipeId: basicPack[0].fipeId,

          registros: records,
        },
      ],
      registros: records,
    });
  });
  test('should parse input to QueryBasicPackVo with all fields null', () => {
    const basicPack: ReadonlyArray<BasicPackVo> = [
      {
        fipeId: 1123,
        modelYear: 2022,
        records: [
          {
            aftermarketMakerDescription: null,
            complement: null,
            isGenuine: null,
            nicknameDescription: null,
            nicknameId: null,
            partNumber: null,
            value: null,
          },
        ],
      },
    ];

    const result: QueryBasicPackVo = BasicPackParser.parse(basicPack);

    expect(result).toStrictEqual({
      veiculosFipe: [
        {
          fipeId: 1123,
          registros: [
            {
              IdApelido: null,
              apelidoDescricao: null,
              aposDescricaoFabricante: null,
              complemento: null,
              genuina: null,
              numeroPeca: null,
              valor: null,
            },
          ],
        },
      ],
      registros: [
        {
          IdApelido: null,
          apelidoDescricao: null,
          aposDescricaoFabricante: null,
          complemento: null,
          genuina: null,
          numeroPeca: null,
          valor: null,
        },
      ],
    });
  });
});
