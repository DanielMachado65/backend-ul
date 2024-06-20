import { AggregateLocatorVo } from 'src/domain/value-object/aggregate-locator.vo';
import { QueryAggregateLocatorVo } from 'src/domain/value-object/query/query-aggregate-locator.vo';
import { AggregateLocatorParser } from 'src/infrastructure/service/query/parser/aggregate-locator-parser';

const mockAggregateLocatorVo = (): ReadonlyArray<AggregateLocatorVo> => [
  {
    brand: 'any_brand 1',
    details: 'details 1',
    imagemUrl: 'any_url 1',
    manufactureYear: 2020,
    model: 'any_model_1',
    modelYear: 2021,
    part: 'any_part',
    vehicleType: 'any_vehicle_type',
  },
  {
    brand: 'any_brand 2',
    details: 'details 2',
    imagemUrl: 'any_url 2',
    manufactureYear: 2023,
    model: 'any_model_2',
    modelYear: 2024,
    part: 'any_part 2',
    vehicleType: 'any_vehicle_type 2',
  },
];

describe(AggregateLocatorParser.name, () => {
  test('should return an empty array if input is not an array', () => {
    const result: ReadonlyArray<QueryAggregateLocatorVo> = AggregateLocatorParser.parse(null);

    expect(result).toStrictEqual([]);

    const result2: ReadonlyArray<QueryAggregateLocatorVo> = AggregateLocatorParser.parse([]);

    expect(result2).toStrictEqual([]);
  });

  test('should parse to QueryAggregateLocatorVo', () => {
    const aggregateLocator: ReadonlyArray<AggregateLocatorVo> = mockAggregateLocatorVo();
    const result: ReadonlyArray<QueryAggregateLocatorVo> = AggregateLocatorParser.parse(aggregateLocator);

    expect(result).toStrictEqual([
      {
        anoFabricacao: aggregateLocator[0].manufactureYear.toString(),
        anoModelo: aggregateLocator[0].modelYear.toString(),
        imagemUrl: aggregateLocator[0].imagemUrl,
        marca: aggregateLocator[0].brand,
        modelo: aggregateLocator[0].model,
        observacao: aggregateLocator[0].details,
        parte: aggregateLocator[0].part,
        tipoVeiculo: aggregateLocator[0].vehicleType,
      },
      {
        anoFabricacao: aggregateLocator[1].manufactureYear.toString(),
        anoModelo: aggregateLocator[1].modelYear.toString(),
        imagemUrl: aggregateLocator[1].imagemUrl,
        marca: aggregateLocator[1].brand,
        modelo: aggregateLocator[1].model,
        observacao: aggregateLocator[1].details,
        parte: aggregateLocator[1].part,
        tipoVeiculo: aggregateLocator[1].vehicleType,
      },
    ]);
  });

  test('should parse to QueryAggregateLocatorVo with all fields null', () => {
    const aggregateLocator: ReadonlyArray<AggregateLocatorVo> = [
      {
        brand: null,
        details: null,
        imagemUrl: null,
        manufactureYear: null,
        model: null,
        modelYear: null,
        part: null,
        vehicleType: null,
      },
    ];
    const result: ReadonlyArray<QueryAggregateLocatorVo> = AggregateLocatorParser.parse(aggregateLocator);

    expect(result).toStrictEqual([
      {
        anoFabricacao: undefined,
        anoModelo: undefined,
        imagemUrl: null,
        marca: null,
        modelo: null,
        observacao: null,
        parte: null,
        tipoVeiculo: null,
      },
    ]);
  });
});
