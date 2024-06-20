import { QueryEvidenceOfTheftVo } from 'src/domain/value-object/query/query-evidence-of-theft.vo';
import { EvidenceOfTheftParser } from 'src/infrastructure/service/query/parser/evidence-of-theft-parser';

describe(EvidenceOfTheftParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryEvidenceOfTheftVo = EvidenceOfTheftParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryEvidenceOfTheftVo = EvidenceOfTheftParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryEvidenceOfTheftVo', () => {
    const result: QueryEvidenceOfTheftVo = EvidenceOfTheftParser.parse({ hasTheft: true });
    expect(result).toStrictEqual({ descricao: 'CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😑' });

    const result2: QueryEvidenceOfTheftVo = EvidenceOfTheftParser.parse({ hasTheft: false });
    expect(result2).toStrictEqual({ descricao: 'NÃO CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😃' });
  });

  test('should parse input to QueryEvidenceOfTheftVo with fields null', () => {
    const result2: QueryEvidenceOfTheftVo = EvidenceOfTheftParser.parse({ hasTheft: null });
    expect(result2).toStrictEqual({ descricao: 'NÃO CONSTA INDÍCIO DE SINISTRO PARA O VEÍCULO INFORMADO 😃' });
  });
});
