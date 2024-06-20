import { QuerySignOfAccidentVo } from 'src/domain/value-object/query/query-sign-of-accident.vo';
import { SignOfAccidentParser } from 'src/infrastructure/service/query/parser/sign-of-accident-parser';

describe(SignOfAccidentParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QuerySignOfAccidentVo = SignOfAccidentParser.parse(null);
    expect(result).toBe(null);

    const result2: QuerySignOfAccidentVo = SignOfAccidentParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QuerySignOfAccidentVo', () => {
    const result: QuerySignOfAccidentVo = SignOfAccidentParser.parse({ hasSignOfAccident: true });
    expect(result).toStrictEqual({ descricao: 'CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😑' });

    const result2: QuerySignOfAccidentVo = SignOfAccidentParser.parse({ hasSignOfAccident: false });
    expect(result2).toStrictEqual({ descricao: 'NÃO CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😃' });
  });

  test('should parse input to QuerySignOfAccidentVo with fields null', () => {
    const result2: QuerySignOfAccidentVo = SignOfAccidentParser.parse({ hasSignOfAccident: null });
    expect(result2).toStrictEqual({ descricao: 'NÃO CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😃' });
  });
});
