import { Injectable } from '@nestjs/common';
import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import {
  TestDriveDataSheet,
  TestDriveFipePriceHistory,
  TestDriveFipeVersion,
  TestDriveInsuranceQuote,
  TestDriveInsuranceQuoteCoverage,
  TestDriveQueryStatus,
} from 'src/domain/_entity/test-drive-query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { DatasheetRecord, DatasheetRecordSpec, DatasheetVo } from 'src/domain/value-object/datasheet.vo';
import { FipeHistoryRecord, FipePriceHistoryVo } from 'src/domain/value-object/fipe-data.vo';
import { InsuranceQuoteCoverage, InsuranceQuotesVo } from 'src/domain/value-object/insurance-quotes.vo';
import { BlogPostVo, VideoPostVo } from 'src/domain/value-object/vehicle-review.vo';
import { StringUtil } from 'src/infrastructure/util/string.util';
import { VehicleUtil } from 'src/infrastructure/util/vehicle.util';

type DataSheetInformation = Pick<
  TestDriveDataSheet,
  'desempenho' | 'consumo' | 'geral' | 'transmissao' | 'freios' | 'direcao'
>;

type CoverageBasicInfo = Pick<TestDriveInsuranceQuoteCoverage, 'order' | 'name' | 'description' | 'isIncluded'>;

@Injectable()
export class TestDriveResponseParser {
  private static readonly MONTHS: ReadonlyArray<string> = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];
  private static readonly DATASHEET_DESCRIPTIONS: ReadonlyArray<string> = [
    'desempenho',
    'consumo',
    'geral',
    'transmissao',
    'freios',
    'direcao',
  ];
  private static readonly PIER_EXTERNAL_URL: string =
    'https://www.pier.digital/seguro-auto?utm_source=parceiro-olho-no-carro&utm_medium=pc&utm_campaign=at_3_23_lead_pc-onc_parceiro&utm_content=free';
  private static readonly INSURANCE_TYPES: Record<string, CoverageBasicInfo> = {
    robbery_and_theft: {
      order: 1,
      isIncluded: true,
      name: 'Roubo e Furto + Assistências 24 horas',
      description:
        'Seu carro protegido contra roubo e Furto. Se precisar utilize nossa assistência 24 horas em qualquer lugar do país',
    },
    unlimited_km: {
      order: 2,
      isIncluded: false,
      name: 'Km ilimitado de guincho',
      description:
        'Ao adicionar esse benefício, você poderá utilizar o serviço de guincho para descolar o seu carro ao local desejado sem restrições de quilometragem (Km)',
    },
    total_loss: {
      order: 3,
      isIncluded: false,
      name: 'Perda total',
      description: 'Cobrimos todos os tipos de perda total do seu veículo, incluindo incêndio e desastres da natureza',
    },
    partial_loss: {
      order: 4,
      isIncluded: false,
      name: 'Perda parcial',
      description:
        'Cobrimos o conserto do carro em caso de acidentes, incluindo batidas, incêndio e desastres da natureza mediante pagamento de uma franquia',
    },
  };

  constructor(private readonly _vehicleUtil: VehicleUtil) {}

  parseQueryResponse({
    queryRef,
    response,
    status,
    servicesToReprocess,
  }: QueryResponseDto): Partial<TestDriveQueryDto> {
    const versions: ReadonlyArray<TestDriveFipeVersion> = response.fipeHistory?.map((fipeInfo: FipePriceHistoryVo) => ({
      fipeId: fipeInfo.fipeId,
      versao: fipeInfo.version,
    }));

    return {
      id: queryRef,
      status: status === QueryResponseStatus.SUCCESS || status === QueryResponseStatus.PARTIAL,
      servicesToReprocess: servicesToReprocess,
      queryStatus: this._getQueryStatus(status),
      responseJson: {
        placa: response.aggregate?.plate,
        chassi: response.aggregate?.chassis,
        renavam: response.aggregate?.renavam?.toString(),
        numMotor: response.aggregate?.engineNumber,
        codigoMarcaModelo: response.aggregate?.modelBrandCode,
        brandImageUrl: this._vehicleUtil.getBrandImgSrc(response.aggregate?.brand),
        dadosBasicos: {
          anoFabricacao: response.aggregate?.manufactureYear,
          anoModelo: response.aggregate?.modelYear,
          chassi: response.aggregate?.chassis,
          especie: response.aggregate?.vehicleSpecies,
          marca: response.aggregate?.brand,
          marcaModelo: response.aggregate?.modelBrand,
          modelo: response.aggregate?.model,
          numeroDeFotos: response.partnerInformations?.photos?.length ?? 0,
          placa: response.aggregate?.plate,
          possuiHistoricoKM: !!response.partnerInformations?.km,
          potencia: response.aggregate?.potency,
          renavam: response.aggregate?.renavam?.toString(),
          tipoVeiculo: response.aggregate?.vehicleType,
        },
        fichaTecnica: response?.datasheet?.map((datasheet: DatasheetVo) => {
          const fipeInfo: FipePriceHistoryVo = response?.fipeHistory?.find(
            (fipe: FipePriceHistoryVo) => fipe.fipeId === datasheet.fipeId?.toString(),
          );

          return {
            fipeId: datasheet.fipeId?.toString(),
            valorAtual: fipeInfo?.history?.[0]?.price,
            variacao: this._getPriceVariation(fipeInfo?.history),
            ref: this._getVehicleNameInVersion(fipeInfo),
            precoUltimos6Meses: this._parseFipeHistoryPrice(fipeInfo?.history),
            ...this._filterDataSheetInformation(datasheet.records),
          };
        }),
        versoes: versions,
        opiniaoDoDono: {
          score: {
            conforto: response.ownerOpinion?.comfort,
            cambio: response.ownerOpinion?.cambium,
            consumoNaCidade: response.ownerOpinion?.cityConsumption,
            consumoNaEstrada: response.ownerOpinion?.roadConsumption,
            performance: response.ownerOpinion?.performance,
            dirigibilidade: response.ownerOpinion?.drivability,
            espacoInterno: response.ownerOpinion?.internalSpace,
            estabilidade: response.ownerOpinion?.stability,
            freios: response.ownerOpinion?.brakes,
            portaMalas: response.ownerOpinion?.trunk,
            suspensao: response.ownerOpinion?.suspension,
            custoBeneficio: response.ownerOpinion?.costBenefit,
            totalScore: response.ownerOpinion?.totalScore,
          },
        },

        cotacaoSeguro: this._parseInsuranceQuotes(response.insuranceQuotes, versions),
        avaliacaoVeicular: response.review && {
          codigoMarcaModelo: response.review?.modelBrandCode,
          anoModelo: response.review?.modelYear,
          blogPosts: response.review?.blogPosts?.map((blogPost: BlogPostVo) => ({
            blogUrl: blogPost?.blogUrl,
          })),
          videoPosts: response.review?.videoPosts?.map((videoPost: VideoPostVo) => ({
            videoUrl: videoPost?.videoUrl,
          })),
        },

        // headerInfos: {},
      },
    };
  }

  private _getQueryStatus(status: QueryResponseStatus): TestDriveQueryStatus {
    return status === QueryResponseStatus.SUCCESS || status === QueryResponseStatus.PARTIAL
      ? TestDriveQueryStatus.SUCCESS
      : TestDriveQueryStatus.FAILURE;
  }

  private _parseInsuranceQuotes(
    insuranceQuotes: ReadonlyArray<InsuranceQuotesVo>,
    versions: ReadonlyArray<TestDriveFipeVersion>,
  ): ReadonlyArray<TestDriveInsuranceQuote> {
    if (!Array.isArray(insuranceQuotes)) return [];

    const result: ReadonlyArray<TestDriveInsuranceQuote> = insuranceQuotes?.map((insuranceQuote: InsuranceQuotesVo) => {
      const fipeVersion: TestDriveFipeVersion = versions?.find(
        (version: TestDriveFipeVersion) => version.fipeId === insuranceQuote.fipeId,
      );
      return {
        externalUrl: TestDriveResponseParser.PIER_EXTERNAL_URL,
        vehicleVersion: fipeVersion?.versao ?? null,
        coverages: insuranceQuote.coverages
          .map((coverage: InsuranceQuoteCoverage) => {
            const insurance: CoverageBasicInfo = TestDriveResponseParser.INSURANCE_TYPES[coverage.kind];

            return (
              insurance && {
                order: insurance.order,
                name: insurance.name,
                description: insurance.description,
                isIncluded: insurance.isIncluded,
                type: coverage.kind,
                price: coverage.priceCents,
              }
            );
          })
          .filter((coverage: TestDriveInsuranceQuoteCoverage) => !!coverage)
          .sort((a: TestDriveInsuranceQuoteCoverage, b: TestDriveInsuranceQuoteCoverage) => a.order - b.order),
      };
    });

    return result;
  }

  private _parseFipeHistoryPrice(history: ReadonlyArray<FipeHistoryRecord>): ReadonlyArray<TestDriveFipePriceHistory> {
    if (!Array.isArray(history)) return [];

    return history
      .map(({ price, month, year }: FipeHistoryRecord) => ({
        x: `${TestDriveResponseParser.MONTHS[month]}/${year}`,
        y: price,
      }))
      .reverse();
  }

  private _getPriceVariation(priceHistory: ReadonlyArray<FipeHistoryRecord>): string {
    if (!priceHistory || !priceHistory.length) return null;
    const start: number = priceHistory[0].price;
    const end: number = priceHistory[priceHistory.length - 1].price;
    const variation: number = ((end - start) / start) * 100;
    const variationPercentage: string = `${variation.toFixed(2)}%`;
    return variation < 0 ? variationPercentage : `+${variationPercentage}`;
  }

  private _getVehicleNameInVersion(fipeInformation: FipePriceHistoryVo): string {
    if (fipeInformation === null || fipeInformation === undefined) return null;
    const brand: string = (fipeInformation?.brand?.toString() || '').toUpperCase();
    const model: string = (fipeInformation?.model?.toString() || '').toUpperCase();
    const version: string = (fipeInformation?.version?.toString() || '').toUpperCase();
    return brand + ' ' + model + ' ' + version;
  }

  private _filterDataSheetInformation(records: ReadonlyArray<DatasheetRecord>): DataSheetInformation {
    if (!Array.isArray(records)) return undefined;

    const dataSheetInformation: DataSheetInformation = records.reduce<DataSheetInformation>(
      (acc: DataSheetInformation, current: DatasheetRecord) => {
        const currentDescritption: string = StringUtil.normalizeString(current.description);
        if (TestDriveResponseParser.DATASHEET_DESCRIPTIONS.includes(currentDescritption))
          return {
            ...acc,
            [currentDescritption]: current.specs.map((spec: DatasheetRecordSpec) => ({
              propriedade: spec.property ?? null,
              valor: spec.value ?? null,
            })),
          };
        return acc;
      },
      {} as DataSheetInformation,
    );

    return dataSheetInformation;
  }
}
