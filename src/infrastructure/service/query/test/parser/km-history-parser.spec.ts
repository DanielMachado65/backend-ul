import { KmBaseVo } from 'src/domain/value-object/km-history.vo';
import { QueryKmHistory } from 'src/domain/value-object/query/query-base-km.vo';
import { KmBaseParser } from 'src/infrastructure/service/query/parser/km-history-parser';

const mockKmHistory = (): KmBaseVo => ({
  chassis: 'any_chassis',
  city: 'any_city',
  plate: 'any_plate',
  renavam: 'any_renavam',
  uf: 'any_uf',
  kmHistory: [
    { includedDate: '2016-05-27T00:00:00.000Z', km: 10000 },
    { includedDate: '2018-05-27T00:00:00.000Z', km: 20000 },
  ],
});

describe(KmBaseParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: ReadonlyArray<QueryKmHistory> = KmBaseParser.parse(null);
    expect(result).toStrictEqual([]);

    const result2: ReadonlyArray<QueryKmHistory> = KmBaseParser.parse(undefined);
    expect(result2).toStrictEqual([]);
  });

  test('should parse input to QueryKmHistory', () => {
    const kmBase: KmBaseVo = mockKmHistory();

    const result: ReadonlyArray<QueryKmHistory> = KmBaseParser.parse(kmBase);

    expect(result).toStrictEqual([
      {
        dataInclusao: kmBase.kmHistory[0].includedDate,
        km: 10000,
      },
      {
        dataInclusao: kmBase.kmHistory[1].includedDate,
        km: 20000,
      },
    ]);
  });

  test('should parse input to QueryKmHistory kmHistory null', () => {
    const kmBase: KmBaseVo = { ...mockKmHistory(), kmHistory: null };

    const result: ReadonlyArray<QueryKmHistory> = KmBaseParser.parse(kmBase);

    expect(result).toStrictEqual([]);
  });
});
