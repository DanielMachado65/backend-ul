import { FipeDataVo } from 'src/domain/value-object/fipe-data.vo';
import { InsuranceQuotesVo } from 'src/domain/value-object/insurance-quotes.vo';
import { QueryInsuranceQuoteVo } from 'src/domain/value-object/query/query-insurance-quote.vo';
import { InsuranceQuotesParser } from 'src/infrastructure/service/query/parser/insurance-quotes-parser';

const mockInsuranceQuotesVo = (): ReadonlyArray<InsuranceQuotesVo> => [
  {
    fipeId: 'fipe_id_1',
    model: 'model_1',
    modelYear: 2023,
    coverages: [
      {
        kind: 'kind 1',
        priceCents: 11111,
      },
    ],
  },
  {
    fipeId: 'fipe_id_2',
    model: 'model_2',
    modelYear: 2021,
    coverages: [
      {
        kind: 'kind 2',
        priceCents: 323,
      },
    ],
  },
];

const mockFipeData = (): ReadonlyArray<FipeDataVo> => [
  {
    brand: 'brand_1',
    fipeId: 'fipe_id_1',
    model: 'model_1',
    version: 'version_1',
    modelYear: 2022,
    modelBrand: 'model_brand_1',
    modelBrandCode: 32123,
  },
  {
    brand: 'brand_2',
    fipeId: 'fipe_id_2',
    model: 'model_2',
    version: 'version_2',
    modelYear: 2022,
    modelBrand: 'model_brand_2',
    modelBrandCode: 32123,
  },
];

describe(InsuranceQuotesParser.name, () => {
  test('should return an empty array if input is not an array', () => {
    const result: QueryInsuranceQuoteVo = InsuranceQuotesParser.parse(null, null);
    expect(result).toStrictEqual({ versoes: [] });

    const result2: QueryInsuranceQuoteVo = InsuranceQuotesParser.parse([], []);
    expect(result2).toStrictEqual({ versoes: [] });
  });

  test('should parse input to QueryInsuranceQuoteVo', () => {
    const insuranceQuotes: ReadonlyArray<InsuranceQuotesVo> = mockInsuranceQuotesVo();
    const fipeData: ReadonlyArray<FipeDataVo> = mockFipeData();

    const result: QueryInsuranceQuoteVo = InsuranceQuotesParser.parse(insuranceQuotes, fipeData);

    expect(result).toStrictEqual({
      versoes: [
        {
          anoModelo: insuranceQuotes[0].modelYear,
          codigoFipe: insuranceQuotes[0].fipeId,
          modelo: insuranceQuotes[0].model,
          versao: fipeData[0].version,
          coberturas: [
            {
              precoEmCentavos: '11111',
              tipoSeguro: 'kind 1',
              razoesDeRecusca: null,
            },
          ],
        },
        {
          anoModelo: insuranceQuotes[1].modelYear,
          codigoFipe: insuranceQuotes[1].fipeId,
          modelo: insuranceQuotes[1].model,
          versao: fipeData[1].version,
          coberturas: [
            {
              precoEmCentavos: '323',
              tipoSeguro: 'kind 2',
              razoesDeRecusca: null,
            },
          ],
        },
      ],
    });
  });

  test('should parse input to QueryInsuranceQuoteVo with all fields null', () => {
    const insuranceQuotes: ReadonlyArray<InsuranceQuotesVo> = [
      {
        coverages: null,
        fipeId: null,
        model: null,
        modelYear: null,
      },
    ];

    const result: QueryInsuranceQuoteVo = InsuranceQuotesParser.parse(insuranceQuotes, null);

    expect(result).toStrictEqual({
      versoes: [
        {
          anoModelo: null,
          codigoFipe: null,
          modelo: null,
          versao: null,
          coberturas: [],
        },
      ],
    });
  });
  test('should parse input to QueryInsuranceQuoteVo with coverage priceCents null', () => {
    const insuranceQuotes: ReadonlyArray<InsuranceQuotesVo> = [
      {
        coverages: [
          {
            kind: 'kind 1',
            priceCents: null,
          },
        ],
        fipeId: 'fipe1',
        model: 'model1',
        modelYear: 2023,
      },
    ];

    const result: QueryInsuranceQuoteVo = InsuranceQuotesParser.parse(insuranceQuotes, null);

    expect(result).toStrictEqual({
      versoes: [
        {
          anoModelo: 2023,
          codigoFipe: 'fipe1',
          modelo: 'model1',
          versao: null,
          coberturas: [
            {
              precoEmCentavos: null,
              tipoSeguro: 'kind 1',
              razoesDeRecusca: null,
            },
          ],
        },
      ],
    });
  });
  test('should parse input to QueryInsuranceQuoteVo with coverage fields null', () => {
    const insuranceQuotes: ReadonlyArray<InsuranceQuotesVo> = [
      {
        coverages: [
          {
            kind: null,
            priceCents: null,
          },
        ],
        fipeId: 'fipe1',
        model: 'model1',
        modelYear: 2023,
      },
    ];

    const result: QueryInsuranceQuoteVo = InsuranceQuotesParser.parse(insuranceQuotes, null);

    expect(result).toStrictEqual({
      versoes: [
        {
          anoModelo: 2023,
          codigoFipe: 'fipe1',
          modelo: 'model1',
          versao: null,
          coberturas: [],
        },
      ],
    });
  });
});
