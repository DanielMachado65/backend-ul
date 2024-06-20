// TODO - Arrumar o histórico de preço fipe - deverá mostrar os preços mais antigos primeiro

import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import { TestDriveFipePriceHistory } from 'src/domain/_entity/test-drive-query.entity';
import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { MQ } from 'src/domain/_layer/infrastructure/messaging/mq';
import {
  QueryRequestService,
  RequestQuerySupportInfos,
} from 'src/domain/_layer/infrastructure/service/query-request.service';
import { AggregateVo } from 'src/domain/value-object/aggregate.vo';
import { DatasheetRecord, DatasheetRecordSpec, DatasheetVo } from 'src/domain/value-object/datasheet.vo';
import { FipeDataVo, FipePriceHistoryVo } from 'src/domain/value-object/fipe-data.vo';
import { InsuranceQuoteCoverage, InsuranceQuotesVo } from 'src/domain/value-object/insurance-quotes.vo';
import { mockAggregateVo } from 'src/domain/value-object/mocks/aggregate.vo.mock';
import { mockDatasheetVo } from 'src/domain/value-object/mocks/datasheet.vo.mock';
import { mockFipeData, mockFipePriceHistoryVo } from 'src/domain/value-object/mocks/fipe-data.vo.mock';
import { mockInsuranceQuotesVo } from 'src/domain/value-object/mocks/insurance-quotes.vo.mock';
import { mockOwnerOpinionVo } from 'src/domain/value-object/mocks/owner-opinion.mock';
import { mockPartnerInformationsVo } from 'src/domain/value-object/mocks/partner-informations.vo.mock';
import { OwnerOpinionVo } from 'src/domain/value-object/owner-opinion.vo';
import { PartnerInformationsVo } from 'src/domain/value-object/partner-informations.vo';
import { EnvService, EnvVariableName } from 'src/infrastructure/framework/env.service';
import { QueryResponseParser } from 'src/infrastructure/service/query/query-response.parser';
import { TestDriveResponseParser } from 'src/infrastructure/service/query/test-drive-response.parser';
import { TetrisService } from 'src/infrastructure/service/query/tetris.service';
import { VehicleUtil } from 'src/infrastructure/util/vehicle.util';

const mockQueryResponse = (params: Partial<QueryResponseDto> = {}): QueryResponseDto => ({
  id: 'any_query_response_id',
  queryRef: params.queryRef || 'any_query_ref',
  applicationId: 'any_application_id',
  keys: {
    plate: 'any_plate',
  },
  templateQueryId: 'any_template_query_id',
  templateQueryRef: 'any_template_query_ref',
  servicesToReprocess: [],
  status: params.status || QueryResponseStatus.SUCCESS,
  response: {
    plate: 'any_plate',
    chassis: 'any_chassis',
    engine: 'any_engine',
    renavam: 'any_renavam',
    ...params.response,
  },
});

describe(TetrisService.name, () => {
  let sut: TetrisService;
  let module: TestingModule;
  let mq: MQ;
  const baseUrl: string = 'any_url';
  const brandImgSrc: string = 'any_brand_img_src';
  const applicationId: string = 'any_application_id';
  const keys: QueryKeysDto = {
    plate: 'any_plate',
  };
  const templateQueryRef: string = 'any_template_query_ref';
  const queryRef: string = 'any_query_ref';
  const queue: string = 'TetrisQueryQueue';
  const fakeNodeEnv: string = 'invalid_key';

  const support: RequestQuerySupportInfos = {
    userEmail: 'any_email@mail.com',
    userName: 'any_name',
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      providers: [
        TestDriveResponseParser,
        QueryResponseParser,
        {
          provide: QueryRequestService,
          useClass: TetrisService,
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockImplementation((key: EnvVariableName) => {
              if (key === 'APPLICATION_ID') return applicationId;
              if (key === 'TETRIS_BASE_URL') return baseUrl;
              return fakeNodeEnv;
            }),
          },
        },
        {
          provide: VehicleUtil,
          useValue: {
            getBrandImgSrc: jest.fn().mockReturnValue(brandImgSrc),
          },
        },
        {
          provide: MQ,
          useValue: {
            send: jest.fn(),
            buildQueueNameWithNodeEnv: jest.fn().mockReturnValue('invalid_key_TetrisQueryQueue'),
          },
        },
        {
          provide: HttpService,
          useValue: {},
        },
      ],
    }).compile();

    mq = await module.resolve(MQ);
  });

  beforeEach(async () => {
    sut = await module.get(QueryRequestService);
  });

  describe('#requestQuery', () => {
    test('should call mq with correct values', async () => {
      const pattern: string = 'request_query';

      await sut.requestQuery({ keys, queryRef, templateQueryRef, support });

      expect(mq.send).toBeCalledTimes(1);
      expect(mq.send).toBeCalledWith(`${fakeNodeEnv}_${queue}`, {
        pattern: pattern,
        data: { templateQueryRef, queryRef, keys, applicationId, support },
      });
    });

    test('should rethrow if HttpService.post throws', async () => {
      const brokerError: Error = new Error('broker_error');
      jest.spyOn(mq, 'send').mockImplementationOnce(() => {
        throw brokerError;
      });

      const promise: Promise<void> = sut.requestQuery({ keys, queryRef, templateQueryRef, support });

      await expect(promise).rejects.toThrow(brokerError);
    });
  });

  describe('#parseTestDriveResponse', () => {
    test('should parse QueryResponse to TestDriveResponseJson - dadosBasicos', () => {
      const aggregate: AggregateVo = mockAggregateVo();
      const queryResponse: QueryResponseDto = mockQueryResponse({ response: { aggregate } });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());
      expect(parsedResult.responseJson.dadosBasicos).toStrictEqual({
        anoFabricacao: aggregate.manufactureYear,
        anoModelo: aggregate.modelYear,
        chassi: aggregate.chassis,
        especie: aggregate.vehicleSpecies,
        marca: aggregate.brand,
        marcaModelo: aggregate.modelBrand,
        modelo: aggregate.model,
        numeroDeFotos: 0,
        placa: aggregate.plate,
        possuiHistoricoKM: false,
        potencia: aggregate.potency,
        renavam: aggregate.renavam.toString(),
        tipoVeiculo: aggregate.vehicleType,
      });
    });

    test('should parse QueryResponse to TestDriveResponseJson - dadosBasicos 2', () => {
      const aggregate: AggregateVo = mockAggregateVo();
      const partnerInformations: PartnerInformationsVo = mockPartnerInformationsVo();
      const queryResponse: QueryResponseDto = mockQueryResponse({ response: { aggregate, partnerInformations } });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());
      expect(parsedResult.responseJson.dadosBasicos).toStrictEqual({
        anoFabricacao: aggregate.manufactureYear,
        anoModelo: aggregate.modelYear,
        chassi: aggregate.chassis,
        especie: aggregate.vehicleSpecies,
        marca: aggregate.brand,
        marcaModelo: aggregate.modelBrand,
        modelo: aggregate.model,
        numeroDeFotos: partnerInformations.photos.length,
        placa: aggregate.plate,
        possuiHistoricoKM: !!partnerInformations.km,
        potencia: aggregate.potency,
        renavam: aggregate.renavam.toString(),
        tipoVeiculo: aggregate.vehicleType,
      });
    });

    test('should parse QueryResponse to TestDriveResponseJson - fichaTecnica', () => {
      const fipeId: number = Math.floor(Math.random() * 1000);

      const aggregate: AggregateVo = mockAggregateVo();
      const fipeData1: FipeDataVo = mockFipeData({ fipeId: fipeId.toString() });
      const fipeHistory1: FipePriceHistoryVo = mockFipePriceHistoryVo({ fipeId: fipeId.toString() });
      const datasheet: ReadonlyArray<DatasheetVo> = [{ ...mockDatasheetVo()[0], fipeId }];
      const queryResponse: QueryResponseDto = mockQueryResponse({
        response: { aggregate, fipeData: [fipeData1], fipeHistory: [fipeHistory1], datasheet },
      });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());

      const ref: string = `${fipeHistory1.brand.toUpperCase()} ${fipeHistory1.model.toUpperCase()} ${fipeHistory1.version.toUpperCase()}`;
      const lastSixMonthsPrice: ReadonlyArray<TestDriveFipePriceHistory> = [
        {
          x: 'Out/2022',
          y: fipeHistory1.history[5].price,
        },
        {
          x: 'Nov/2022',
          y: fipeHistory1.history[4].price,
        },
        {
          x: 'Dez/2022',
          y: fipeHistory1.history[3].price,
        },
        {
          x: 'Jan/2023',
          y: fipeHistory1.history[2].price,
        },
        {
          x: 'Fev/2023',
          y: fipeHistory1.history[1].price,
        },
        {
          x: 'Mar/2023',
          y: fipeHistory1.history[0].price,
        },
      ];

      const performance: ReadonlyArray<DatasheetRecordSpec> = datasheet.flatMap(
        (data: DatasheetVo) =>
          data.records.find((record: DatasheetRecord) => record.description === 'Desempenho').specs,
      );
      const consumption: ReadonlyArray<DatasheetRecordSpec> = datasheet.flatMap(
        (data: DatasheetVo) => data.records.find((record: DatasheetRecord) => record.description === 'Consumo').specs,
      );
      const general: ReadonlyArray<DatasheetRecordSpec> = datasheet.flatMap(
        (data: DatasheetVo) => data.records.find((record: DatasheetRecord) => record.description === 'Geral').specs,
      );
      const transmission: ReadonlyArray<DatasheetRecordSpec> = datasheet.flatMap(
        (data: DatasheetVo) =>
          data.records.find((record: DatasheetRecord) => record.description === 'Transmissão').specs,
      );

      const brakes: ReadonlyArray<DatasheetRecordSpec> = datasheet.flatMap(
        (data: DatasheetVo) => data.records.find((record: DatasheetRecord) => record.description === 'Freios').specs,
      );

      const control: ReadonlyArray<DatasheetRecordSpec> = datasheet.flatMap(
        (data: DatasheetVo) => data.records.find((record: DatasheetRecord) => record.description === 'Direção').specs,
      );

      expect(parsedResult.responseJson.fichaTecnica).toStrictEqual([
        {
          fipeId: fipeId.toString(),
          valorAtual: fipeHistory1.history[0].price,
          variacao: expect.any(String),
          ref,
          precoUltimos6Meses: lastSixMonthsPrice,
          desempenho: performance.map((spec: DatasheetRecordSpec) => ({
            propriedade: spec.property,
            valor: spec.value,
          })),
          consumo: consumption.map((spec: DatasheetRecordSpec) => ({
            propriedade: spec.property,
            valor: spec.value,
          })),
          geral: general.map((spec: DatasheetRecordSpec) => ({
            propriedade: spec.property,
            valor: spec.value,
          })),
          transmissao: transmission.map((spec: DatasheetRecordSpec) => ({
            propriedade: spec.property,
            valor: spec.value,
          })),
          freios: brakes.map((spec: DatasheetRecordSpec) => ({
            propriedade: spec.property,
            valor: spec.value,
          })),
          direcao: control.map((spec: DatasheetRecordSpec) => ({
            propriedade: spec.property,
            valor: spec.value,
          })),
        },
      ]);
    });

    test('should parse QueryResponse to TestDriveResponseJson - versoes', () => {
      const fipeId: string = Math.floor(Math.random() * 1000).toString();

      const aggregate: AggregateVo = mockAggregateVo();
      const fipeHistory1: FipePriceHistoryVo = mockFipePriceHistoryVo({ fipeId });
      const queryResponse: QueryResponseDto = mockQueryResponse({
        response: { aggregate, fipeHistory: [fipeHistory1] },
      });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());

      expect(parsedResult.responseJson.versoes).toStrictEqual([
        {
          fipeId,
          versao: fipeHistory1.version,
        },
      ]);
    });

    test('should parse QueryResponse to TestDriveResponseJson - opiniaoDoDono', () => {
      const aggregate: AggregateVo = mockAggregateVo();
      const ownerOpinion: OwnerOpinionVo = mockOwnerOpinionVo();

      const queryResponse: QueryResponseDto = mockQueryResponse({
        response: { aggregate, ownerOpinion },
      });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());

      expect(parsedResult.responseJson.opiniaoDoDono).toStrictEqual({
        score: {
          conforto: ownerOpinion.comfort,
          cambio: ownerOpinion.cambium,
          consumoNaCidade: ownerOpinion.cityConsumption,
          consumoNaEstrada: ownerOpinion.roadConsumption,
          performance: ownerOpinion.performance,
          dirigibilidade: ownerOpinion.drivability,
          espacoInterno: ownerOpinion.internalSpace,
          estabilidade: ownerOpinion.stability,
          freios: ownerOpinion.brakes,
          portaMalas: ownerOpinion.trunk,
          suspensao: ownerOpinion.suspension,
          custoBeneficio: ownerOpinion.costBenefit,
          totalScore: ownerOpinion.totalScore,
        },
      });
    });

    test('should parse QueryResponse to TestDriveResponseJson - opiniaoDoDono with empty data', () => {
      const aggregate: AggregateVo = mockAggregateVo();

      const queryResponse: QueryResponseDto = mockQueryResponse({
        response: { aggregate, ownerOpinion: null },
      });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());

      expect(parsedResult.responseJson.opiniaoDoDono).toStrictEqual({
        score: {
          conforto: undefined,
          cambio: undefined,
          consumoNaCidade: undefined,
          consumoNaEstrada: undefined,
          performance: undefined,
          dirigibilidade: undefined,
          espacoInterno: undefined,
          estabilidade: undefined,
          freios: undefined,
          portaMalas: undefined,
          suspensao: undefined,
          custoBeneficio: undefined,
          totalScore: undefined,
        },
      });
    });

    test('should parse QueryResponse to TestDriveResponseJson - cotacaoSeguro', () => {
      const aggregate: AggregateVo = mockAggregateVo();
      const fipeId: string = Math.floor(Math.random() * 1000).toString();
      const fipeHistory1: FipePriceHistoryVo = mockFipePriceHistoryVo({ fipeId });
      const insuranceQuote1: InsuranceQuotesVo = mockInsuranceQuotesVo({ fipeId });

      const queryResponse: QueryResponseDto = mockQueryResponse({
        response: { aggregate, insuranceQuotes: [insuranceQuote1], fipeHistory: [fipeHistory1] },
      });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());

      const externalUrl: string =
        'https://www.pier.digital/seguro-auto?utm_source=parceiro-olho-no-carro&utm_medium=pc&utm_campaign=at_3_23_lead_pc-onc_parceiro&utm_content=free';

      expect(parsedResult.responseJson.cotacaoSeguro).toStrictEqual([
        {
          externalUrl,
          vehicleVersion: fipeHistory1.version,
          coverages: insuranceQuote1.coverages.map((coverage: InsuranceQuoteCoverage) => ({
            order: expect.any(Number),
            name: expect.any(String),
            description: expect.any(String),
            isIncluded: expect.any(Boolean),
            type: coverage.kind,
            price: coverage.priceCents,
          })),
        },
      ]);
    });

    test('should parse QueryResponse to TestDriveResponseJson - cotacaoSeguro without fipe info', () => {
      const aggregate: AggregateVo = mockAggregateVo();
      const fipeId: string = Math.floor(Math.random() * 1000).toString();
      const insuranceQuote1: InsuranceQuotesVo = mockInsuranceQuotesVo({ fipeId });

      const queryResponse: QueryResponseDto = mockQueryResponse({
        response: { aggregate, insuranceQuotes: [insuranceQuote1] },
      });

      const parsedResult: Partial<TestDriveQueryDto> = sut.parseTestDriveResponse(queryResponse);

      expect(parsedResult.id).toBe(queryResponse.queryRef);
      expect(parsedResult.responseJson.brandImageUrl).toBe(brandImgSrc);
      expect(parsedResult.responseJson.chassi).toBe(aggregate.chassis);
      expect(parsedResult.responseJson.placa).toBe(aggregate.plate);
      expect(parsedResult.responseJson.numMotor).toBe(aggregate.engineNumber);
      expect(parsedResult.responseJson.renavam).toBe(aggregate.renavam.toString());

      expect(parsedResult.responseJson.cotacaoSeguro).toStrictEqual([
        {
          externalUrl: expect.any(String),
          vehicleVersion: null,
          coverages: expect.any(Array),
        },
      ]);
    });
  });
});
