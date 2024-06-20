import { QueryRenajudVo } from 'src/domain/value-object/query/query-renajud.vo';
import { RenajudVo } from 'src/domain/value-object/renajud.vo';
import { RenajudParser } from 'src/infrastructure/service/query/parser/renajud-parser';

const mockRenajudVo = (): ReadonlyArray<RenajudVo> => [
  {
    codeCourt: 'code_court 1',
    judicialBody: 'judicial_body 1',
    process: 'process 1',
    restrictions: 'restrictions 1',
    court: 'court 1',
    inclusionDate: new Date(),
    detailRenajud: 'detail_renajud 1',
    consistsRenajud: true,
  },
  {
    codeCourt: 'code_court 2',
    judicialBody: 'judicial_body 2',
    process: 'process 2',
    restrictions: 'restrictions 2',
    court: 'court 2',
    inclusionDate: new Date(),
    detailRenajud: 'detail_renajud 2',
    consistsRenajud: false,
  },
];

describe(RenajudParser.name, () => {
  test('should return null if input is not an array', () => {
    const result: ReadonlyArray<QueryRenajudVo> = RenajudParser.parse(null);
    expect(result).toStrictEqual(null);

    const result2: ReadonlyArray<QueryRenajudVo> = RenajudParser.parse([]);
    expect(result2).toStrictEqual([]);
  });

  test('should parse input to QueryRenajudVo', () => {
    const renajud: ReadonlyArray<RenajudVo> = mockRenajudVo();

    const result: ReadonlyArray<QueryRenajudVo> = RenajudParser.parse(renajud);

    expect(result).toStrictEqual([
      {
        codigoTribunal: 'code_court 1',
        orgaoJudicial: 'judicial_body 1',
        codigoOrgaoJudicial: null,
        processo: 'process 1',
        restricoes: 'restrictions 1',
        tribunal: 'court 1',
        dataInclusao: renajud[0].inclusionDate.toLocaleString(),
        detalheRenajud: 'detail_renajud 1',
        constaRenajud: true,
      },
      {
        codigoTribunal: 'code_court 2',
        orgaoJudicial: 'judicial_body 2',
        codigoOrgaoJudicial: null,
        processo: 'process 2',
        restricoes: 'restrictions 2',
        tribunal: 'court 2',
        dataInclusao: renajud[1].inclusionDate.toLocaleString(),
        detalheRenajud: 'detail_renajud 2',
        constaRenajud: false,
      },
    ]);
  });
  test('should parse input to QueryRenajudVo with all fields null', () => {
    const renajud: ReadonlyArray<RenajudVo> = [
      {
        codeCourt: null,
        consistsRenajud: null,
        court: null,
        detailRenajud: null,
        inclusionDate: null,
        judicialBody: null,
        process: null,
        restrictions: null,
      },
    ];

    const result: ReadonlyArray<QueryRenajudVo> = RenajudParser.parse(renajud);

    expect(result).toStrictEqual([
      {
        codigoTribunal: null,
        orgaoJudicial: null,
        codigoOrgaoJudicial: null,
        processo: null,
        restricoes: null,
        tribunal: null,
        dataInclusao: null,
        detalheRenajud: null,
        constaRenajud: null,
      },
    ]);
  });
});
