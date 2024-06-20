import { OwnerHistoryVo } from 'src/domain/value-object/owner-history.vo';
import { QueryVehicleOwnersVo } from 'src/domain/value-object/query/query-vehicle-owners.vo';
import { OwnerHistoryParser } from 'src/infrastructure/service/query/parser/owner-history-parser';

const mockOwnerHistory = (): OwnerHistoryVo => ({
  firstRecord: 'first_record',
  lastRecord: 'last_record',
  total: 3,
  totalPF: 2,
  totalPJ: 1,
  ufs: ['RS', 'SC'],
});

describe(OwnerHistoryParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryVehicleOwnersVo = OwnerHistoryParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryVehicleOwnersVo = OwnerHistoryParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryVehicleOwnersVo', () => {
    const ownerHistory: OwnerHistoryVo = mockOwnerHistory();

    const result: QueryVehicleOwnersVo = OwnerHistoryParser.parse(ownerHistory);

    expect(result).toStrictEqual({
      primeiroRegistro: 'first_record',
      ultimoRegistro: 'last_record',
      total: 3,
      quantidadePf: 2,
      quantidadePJ: 1,
      ufs: ['RS', 'SC'],
    });
  });

  test('should parse input to QueryVehicleOwnersVo with fields null', () => {
    const ownerHistory: OwnerHistoryVo = {
      firstRecord: null,
      lastRecord: null,
      total: null,
      totalPF: null,
      totalPJ: null,
      ufs: [],
    };

    const result: QueryVehicleOwnersVo = OwnerHistoryParser.parse(ownerHistory);

    expect(result).toStrictEqual({
      primeiroRegistro: null,
      ultimoRegistro: null,
      total: null,
      quantidadePf: null,
      quantidadePJ: null,
      ufs: [],
    });
  });
});
