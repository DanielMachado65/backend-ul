import { QueryRevisionVo } from 'src/domain/value-object/query/query-revision.vo';
import { RevisionVo } from 'src/domain/value-object/revision.vo';
import { RevisionParser } from 'src/infrastructure/service/query/parser/revision-parser';
import { mockRevisonVo } from 'src/infrastructure/service/query/test/parser/mocks/special-datasheet.mock';

describe(RevisionParser.name, () => {
  test('should return an empty array if input is not an array', () => {
    const result: QueryRevisionVo = RevisionParser.parse(null);

    expect(result).toStrictEqual({ veiculosFipe: [] });

    const result2: QueryRevisionVo = RevisionParser.parse([]);

    expect(result2).toStrictEqual({ veiculosFipe: [] });
  });

  test('should parse input to QueryRevisionVo', () => {
    const revision: ReadonlyArray<RevisionVo> = mockRevisonVo();

    const result: QueryRevisionVo = RevisionParser.parse(revision);

    expect(result).toStrictEqual({
      veiculosFipe: [
        {
          fipeId: revision[0].fipeId.toString(),
          idVersao: revision[0].versionId.toString(),
          registros: [
            {
              kilometragem: 100232,
              meses: 9,
              parcelas: 19,
              duracaoEmMinutos: 100,
              precoTotal: 1031323,
              precoParcela: 10333,
              pecasTrocadas: [
                {
                  descricao: 'description 1',
                  quantidade: 321,
                },
              ],
              inspecoes: ['aaaa', 'bbbb'],
            },
            {
              kilometragem: 32311,
              meses: 3,
              parcelas: 1,
              duracaoEmMinutos: 32,
              precoTotal: 3545,
              precoParcela: 4343,
              pecasTrocadas: [
                {
                  descricao: 'description 2',
                  quantidade: 3,
                },
              ],
              inspecoes: ['cccc', 'dddd'],
            },
          ],
        },
      ],
    });
  });
  test('should parse input to QueryRevisionVo with revisions fields null', () => {
    const revision: ReadonlyArray<RevisionVo> = [
      {
        fipeId: 12345,
        versionId: 12222,
        year: null,
        records: [
          {
            changedParts: null,
            durationMinutes: null,
            fullPrice: null,
            inspections: null,
            kilometers: null,
            months: null,
            parcelPrice: null,
            parcels: null,
          },
        ],
      },
    ];

    const result: QueryRevisionVo = RevisionParser.parse(revision);

    expect(result).toStrictEqual({
      veiculosFipe: [
        {
          fipeId: '12345',
          idVersao: '12222',
          registros: [
            {
              kilometragem: null,
              meses: null,
              parcelas: null,
              duracaoEmMinutos: null,
              precoTotal: null,
              precoParcela: null,
              pecasTrocadas: undefined,
              inspecoes: null,
            },
          ],
        },
      ],
    });
  });
});
