import { QueryRobberyAndTheftVo } from 'src/domain/value-object/query/query-robbery-and-theft.vo';
import { RobberyAndTheftVo } from 'src/domain/value-object/robbery-and-theft.vo';
import { RobberyAndTheftParser } from 'src/infrastructure/service/query/parser/robbery-and-theft-parser';

const mockRobberyAndTheftVo = (): RobberyAndTheftVo => ({
  containsActiveOccurrence: true,
  containsOccurrence: true,
  historic: [
    {
      modelBrand: 'model_brand',
      chassis: 'chassis',
      color: 'color',
      occurrenceDate: '01/01/2021',
      declaration: 'declaration',
      occurrenceCity: 'municipality_occurrence',
      occurrence: 'occurence',
      plate: 'plate',
      reportCard: 'report_card',
      ufOccurrence: 'uf',
    },
  ],
  indicatorProvenance: 'indicator_provenance',
  licencePlateCity: 'municipality_licence_plate',
});

describe(RobberyAndTheftParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryRobberyAndTheftVo = RobberyAndTheftParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryRobberyAndTheftVo = RobberyAndTheftParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryRobberyAndTheftVo', () => {
    const robbery: RobberyAndTheftVo = mockRobberyAndTheftVo();

    const result: QueryRobberyAndTheftVo = RobberyAndTheftParser.parse(robbery);

    expect(result).toStrictEqual({
      constaOcorrencia: true,
      constaOcorrenciaAtiva: true,
      historico: [
        {
          boletim: 'report_card',
          chassi: 'chassis',
          cor: 'color',
          dataOcorrencia: robbery.historic[0].occurrenceDate,
          declaracao: 'declaration',
          marcaModelo: 'model_brand',
          municipioOcorrencia: 'municipality_occurrence',
          ocorrencia: 'occurence',
          placa: 'plate',
          ufOcorrencia: 'uf',
        },
      ],
      indicadorProcedencia: 'indicator_provenance',
      municipioEmplacamento: 'municipality_licence_plate',
    });
  });
});
