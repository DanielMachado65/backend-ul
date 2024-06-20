import { AuctionScoreVo, AuctionVo } from 'src/domain/value-object/auction.vo';
import { QueryAuctionVo } from 'src/domain/value-object/query/query-auction.vo';
import { AuctionParser } from 'src/infrastructure/service/query/parser/auction-parser';

const mockAuctionVo = (): ReadonlyArray<AuctionVo> => [
  {
    auctionDate: 'auction_date_1',
    auctioneer: 'auctioneer_1',
    batch: 'batch_1',
    model: 'model_1',
    brand: 'brand_1',
    plate: 'plate_1',
    chassis: 'chassis_1',
    color: 'color_1',
    fuel: 'fuel_1',
    vehicleCategory: 'vehicle_category_1',
    chassisSituation: 'chassis_situation_1',
    engineNumber: 'engine_number_1',
    axisAmount: 'axis_amount_1',
    courtyard: 'courtyard_1',
    principal: 'principal_1',
    modelYear: 'model_year_1',
    manufactureYear: 'manufacture_year_1',
    generalCondition: 'general_condition_1',
  },
  {
    auctionDate: 'auction_date_2',
    auctioneer: 'auctioneer_2',
    batch: 'batch_2',
    model: 'model_2',
    brand: 'brand_2',
    plate: 'plate_2',
    chassis: 'chassis_2',
    color: 'color_2',
    fuel: 'fuel_2',
    vehicleCategory: 'vehicle_category_2',
    chassisSituation: 'chassis_situation_2',
    engineNumber: 'engine_number_2',
    axisAmount: 'axis_amount_2',
    courtyard: 'courtyard_2',
    principal: 'principal_2',
    modelYear: 'model_year_2',
    manufactureYear: 'manufacture_year_2',
    generalCondition: 'general_condition_2',
  },
];

const mockAuctionScoreVo = (): AuctionScoreVo => ({
  acceptance: '10',
  percentageOverRef: '34',
  punctuation: '89',
  score: '4',
  specialInspectionRequirement: '90',
});

describe(AuctionParser.name, () => {
  test('should return an empty array if input is not an array', () => {
    const result: QueryAuctionVo = AuctionParser.parse(null, null);

    expect(result).toStrictEqual(null);

    const result2: QueryAuctionVo = AuctionParser.parse([], null);

    expect(result2).toStrictEqual({
      descricao: 'Não consta registro de leilão para o veículo informado',
      registros: [],
      score: {
        aceitacao: null,
        exigenciaVistoriaEspecial: null,
        percentualSobreRef: null,
        pontuacao: null,
        score: null,
      },
    });
  });

  test('should parse input to QueryAuctionVo', () => {
    const auctions: ReadonlyArray<AuctionVo> = mockAuctionVo();
    const auctionScore: AuctionScoreVo = mockAuctionScoreVo();
    const result: QueryAuctionVo = AuctionParser.parse(auctions, auctionScore);

    expect(result).toStrictEqual({
      descricao: 'Consta registro de leilão para o veículo informado',
      registros: [
        {
          anoFabricacao: 'manufacture_year_1',
          anoModelo: 'model_year_1',
          chassi: 'chassis_1',
          comitente: 'principal_1',
          condicaoGeral: 'general_condition_1',
          cor: 'color_1',
          dataLeilao: 'auction_date_1',
          leiloeiro: 'auctioneer_1',
          lote: 'batch_1',
          marca: 'brand_1',
          modelo: 'model_1',
          observacao: null,
          placa: 'plate_1',
        },
        {
          anoFabricacao: 'manufacture_year_2',
          anoModelo: 'model_year_2',
          chassi: 'chassis_2',
          comitente: 'principal_2',
          condicaoGeral: 'general_condition_2',
          cor: 'color_2',
          dataLeilao: 'auction_date_2',
          leiloeiro: 'auctioneer_2',
          lote: 'batch_2',
          marca: 'brand_2',
          modelo: 'model_2',
          observacao: null,
          placa: 'plate_2',
        },
      ],
      score: {
        aceitacao: auctionScore.acceptance,
        exigenciaVistoriaEspecial: auctionScore.specialInspectionRequirement,
        percentualSobreRef: auctionScore.percentageOverRef,
        pontuacao: auctionScore.punctuation,
        score: auctionScore.score,
      },
    });
  });
});
