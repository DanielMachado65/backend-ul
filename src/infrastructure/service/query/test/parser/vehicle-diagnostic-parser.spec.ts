import { QueryVehicleDiagnosticVo } from 'src/domain/value-object/query/query-vehicle-diagnostic.vo';
import { VehicleDiagnosticVo } from 'src/domain/value-object/vehicle-diagnostic.vo';
import { VehicleDiagnosticParser } from 'src/infrastructure/service/query/parser/vehicle-diagnostic-parser';

const mockVehicleDiagnosticVo = (): VehicleDiagnosticVo => ({
  generic: [
    {
      description: 'generic description 1',
      occurrences: 1,
      totalDiagnostics: 1,
      occurrencesPercentage: 'generic occurrencesPercentage 1',
      dtc: 'generic dtc 1',
      solutions: [
        {
          description: 'solution description 1',
        },
        {
          description: 'solution description 2',
        },
      ],
    },
    {
      description: 'generic description 2',
      occurrences: 2,
      totalDiagnostics: 2,
      occurrencesPercentage: 'generic occurrencesPercentage 2',
      dtc: 'generic dtc 2',
      solutions: [
        {
          description: 'solution description 3',
        },
        {
          description: 'solution description 4',
        },
      ],
    },
  ],
  specific: [
    {
      dateTime: 'specific dateTime 1',
      brand: 'specific brand 1',
      vehicle: 'specific vehicle 1',
      odometer: 1,
      system: 'specific system 1',
      model: 'specific model 1',
      chassis: 'specific chassis 1',
      year: 2022,
      parameters: [
        {
          description: 'specific parameter description 1',
          unit: 'specific parameter unit 1',
          value: 'specific parameter value 1',
        },
      ],
      crashList: [
        {
          description: 'specific crash list description 1',
          dtc: 'specific crash list dtc 1',
          occurrences: 1,
          occurrencesPercentage: 'specific crash list occurrences percentage 1',
          totalDiagnostics: 1,
          solutions: [
            {
              description: 'specific crash list solution description 1',
            },
          ],
        },
      ],
    },
  ],
});

describe(VehicleDiagnosticParser.name, () => {
  test('should return null if input is null or undefined', () => {
    const result: QueryVehicleDiagnosticVo = VehicleDiagnosticParser.parse(null);
    expect(result).toBe(null);

    const result2: QueryVehicleDiagnosticVo = VehicleDiagnosticParser.parse(undefined);
    expect(result2).toBe(null);
  });

  test('should parse input to QueryVehicleDiagnosticVo', () => {
    const vehicleDiagnostic: VehicleDiagnosticVo = mockVehicleDiagnosticVo();

    const result: QueryVehicleDiagnosticVo = VehicleDiagnosticParser.parse(vehicleDiagnostic);

    expect(result).toStrictEqual({
      especifico: {
        diagnostico: [
          {
            dataHora: 'specific dateTime 1',
            listaFalhas: [
              {
                descricao: 'specific crash list description 1',
                dtc: 'specific crash list dtc 1',
                ocorrencias: 1,
                porcentagemOcorrida: 'specific crash list occurrences percentage 1',
                solucao: [
                  {
                    descricao: 'specific crash list solution description 1',
                  },
                ],
                totalDiagnosticos: 1,
              },
            ],
            odometro: 1,
            parametros: [
              {
                descricao: 'specific parameter description 1',
                unidade: 'specific parameter unit 1',
                valor: 'specific parameter value 1',
              },
            ],
          },
        ],
      },
      generico: {
        listaFalhas: [
          {
            descricao: 'generic description 1',
            dtc: 'generic dtc 1',
            ocorrencias: 1,
            porcentagemOcorrida: 'generic occurrencesPercentage 1',
            solucao: [
              {
                descricao: 'solution description 1',
              },
              {
                descricao: 'solution description 2',
              },
            ],
            totalDiagnosticos: 1,
          },
          {
            descricao: 'generic description 2',
            dtc: 'generic dtc 2',
            ocorrencias: 2,
            porcentagemOcorrida: 'generic occurrencesPercentage 2',
            solucao: [
              {
                descricao: 'solution description 3',
              },
              {
                descricao: 'solution description 4',
              },
            ],
            totalDiagnosticos: 2,
          },
        ],
      },
    });
  });
  test('should parse input to QueryVehicleDiagnosticVo with fields null', () => {
    const vehicleDiagnostic: VehicleDiagnosticVo = {
      generic: null,
      specific: null,
    };

    const result: QueryVehicleDiagnosticVo = VehicleDiagnosticParser.parse(vehicleDiagnostic);

    expect(result).toStrictEqual({
      especifico: {
        diagnostico: undefined,
      },
      generico: {
        listaFalhas: undefined,
      },
    });
  });

  test('should parse input to QueryVehicleDiagnosticVo with fields null 2', () => {
    const vehicleDiagnostic: VehicleDiagnosticVo = {
      generic: [
        {
          description: null,
          dtc: null,
          occurrences: null,
          occurrencesPercentage: null,
          solutions: null,
          totalDiagnostics: null,
        },
      ],
      specific: [
        {
          brand: null,
          chassis: null,
          crashList: [
            {
              description: null,
              dtc: null,
              occurrences: null,
              occurrencesPercentage: null,
              solutions: null,
              totalDiagnostics: null,
            },
          ],
          dateTime: null,
          model: null,
          odometer: null,
          parameters: [
            {
              description: null,
              unit: null,
              value: null,
            },
          ],
          system: null,
          vehicle: null,
          year: null,
        },
      ],
    };

    const result: QueryVehicleDiagnosticVo = VehicleDiagnosticParser.parse(vehicleDiagnostic);

    expect(result).toStrictEqual({
      especifico: {
        diagnostico: [
          {
            dataHora: null,
            listaFalhas: [
              {
                descricao: null,
                dtc: null,
                ocorrencias: null,
                porcentagemOcorrida: null,
                solucao: undefined,
                totalDiagnosticos: null,
              },
            ],
            odometro: null,
            parametros: [
              {
                descricao: null,
                unidade: null,
                valor: null,
              },
            ],
          },
        ],
      },
      generico: {
        listaFalhas: [
          {
            descricao: null,
            dtc: null,
            ocorrencias: null,
            porcentagemOcorrida: null,
            solucao: undefined,
            totalDiagnosticos: null,
          },
        ],
      },
    });
  });
});
