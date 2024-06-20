import { DatasheetVo } from 'src/domain/value-object/datasheet.vo';
import { QueryDatasheetRecord, QueryDatasheetVo } from 'src/domain/value-object/query/query-datasheet.vo';
import { DataSheetParser } from 'src/infrastructure/service/query/parser/datasheet-parser';
import { mockDataSheetVo } from 'src/infrastructure/service/query/test/parser/mocks/special-datasheet.mock';

describe(DataSheetParser.name, () => {
  test('should return an empty array if input is not an array', () => {
    const result: QueryDatasheetVo = DataSheetParser.parse(null);
    expect(result).toStrictEqual({ registros: [], veiculosFipe: [] });

    const result2: QueryDatasheetVo = DataSheetParser.parse([]);
    expect(result2).toStrictEqual({ registros: [], veiculosFipe: [] });
  });

  test('should parse input to QueryDatasheetVo', () => {
    const datasheet: ReadonlyArray<DatasheetVo> = mockDataSheetVo();

    const result: QueryDatasheetVo = DataSheetParser.parse(datasheet);

    const records: ReadonlyArray<QueryDatasheetRecord> = [
      {
        descricao: datasheet[0].records[0].description,
        especificacoes: [
          {
            propriedade: datasheet[0].records[0].specs[0].property,
            valor: datasheet[0].records[0].specs[0].value,
          },
          {
            propriedade: datasheet[0].records[0].specs[1].property,
            valor: datasheet[0].records[0].specs[1].value,
          },
        ],
      },
      {
        descricao: datasheet[0].records[1].description,
        especificacoes: [
          {
            propriedade: datasheet[0].records[1].specs[0].property,
            valor: datasheet[0].records[1].specs[0].value,
          },
          {
            propriedade: datasheet[0].records[1].specs[1].property,
            valor: datasheet[0].records[1].specs[1].value,
          },
        ],
      },
    ];

    expect(result).toStrictEqual({
      veiculosFipe: [
        {
          fipeId: datasheet[0].fipeId,
          registros: records,
        },
      ],
      registros: records,
    });
  });

  test('should parse input to QueryDatasheetVo with fields description and specs null', () => {
    const datasheet: ReadonlyArray<DatasheetVo> = [
      {
        fipeId: null,
        modelYear: null,
        records: null,
      },
    ];

    const result: QueryDatasheetVo = DataSheetParser.parse(datasheet);

    expect(result).toStrictEqual({ registros: [], veiculosFipe: [] });
  });

  test('should parse input to QueryDatasheetVo with fipeId null', () => {
    const datasheet: ReadonlyArray<DatasheetVo> = [
      {
        fipeId: null,
        modelYear: null,
        records: [
          {
            description: 'any description',
            specs: [
              {
                property: 'asda',
                value: 'qeqe',
              },
            ],
          },
        ],
      },
    ];

    const result: QueryDatasheetVo = DataSheetParser.parse(datasheet);

    expect(result).toStrictEqual({ registros: [], veiculosFipe: [] });
  });

  // test('should parse input to QueryDatasheetVo with description null', () => {
  //   const datasheet: ReadonlyArray<DatasheetVo> = [
  //     {
  //       fipeId: 12345,
  //       records: [
  //         {
  //           description: 'any_description',
  //           specs: [
  //             {
  //               property: null,
  //               value: null,
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ];

  //   const result: QueryDatasheetVo = DataSheetParser.parse(datasheet);

  //   expect(result).toStrictEqual({
  //     registros: [
  //       {
  //         descricao: 'any_description',
  //         especificacoes: [],
  //       },
  //     ],
  //   });
  // });
});
