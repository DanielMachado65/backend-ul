import { Injectable } from '@nestjs/common';

import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import { QueryStatus } from 'src/domain/_entity/query.entity';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ReprocessQueryStatus } from 'src/domain/core/query/reprocess-query-queue.domain';
import { ReprocessInfosDto } from 'src/domain/core/query/v2/response-query.domain';
import { ComparativeAndOwnerOpinionVo } from 'src/domain/value-object/comparative-and-owner-opinion.vo';
import {
  ComparativeEquipmentData,
  ComparativePartData,
  ComparativeSpecData,
  ComparativeVo,
} from 'src/domain/value-object/comparative.vo';
import { OwnerOpinionVo } from 'src/domain/value-object/owner-opinion.vo';
import {
  QueryComparativeEquipmentData,
  QueryComparativePartData,
  QueryComparativeSpecData,
  QueryComparativeVo,
  QueryCompativeOwnerOpinionVo,
  QueryVehicleComparativeVo,
} from 'src/domain/value-object/query/query-comparative.vo';
import { AggregateLocatorParser } from 'src/infrastructure/service/query/parser/aggregate-locator-parser';
import { AggregateParser } from 'src/infrastructure/service/query/parser/aggregate-parser';
import { AuctionParser } from 'src/infrastructure/service/query/parser/auction-parser';
import { AverageCostParser } from 'src/infrastructure/service/query/parser/average-cost-parser';
import { DebstAndFinesParser } from 'src/infrastructure/service/query/parser/debts-and-fines-parser';
import { GravameParser } from 'src/infrastructure/service/query/parser/gravame-parser';
import { InsuranceQuotesParser } from 'src/infrastructure/service/query/parser/insurance-quotes-parser';
import { KmBaseParser } from 'src/infrastructure/service/query/parser/km-history-parser';
import { NationalBaseParser } from 'src/infrastructure/service/query/parser/national-base-parser';
import { OwnerHistoryParser } from 'src/infrastructure/service/query/parser/owner-history-parser';
import { OwnerOpinionParser } from 'src/infrastructure/service/query/parser/owner-opinion-parser';
import { PartnerInformationsParser } from 'src/infrastructure/service/query/parser/partner-informations-parser';
import { RecallParser } from 'src/infrastructure/service/query/parser/recall-parser';
import { RenajudParser } from 'src/infrastructure/service/query/parser/renajud-parser';
import { RobberyAndTheftParser } from 'src/infrastructure/service/query/parser/robbery-and-theft-parser';
import { SignOfAccidentParser } from 'src/infrastructure/service/query/parser/sign-of-accident-parser';
import { SpecialDataSheetParser } from 'src/infrastructure/service/query/parser/special-datasheet-parser';
import { StateBaseParser } from 'src/infrastructure/service/query/parser/state-base-parser';
import { TechnicalAdviceParser } from 'src/infrastructure/service/query/parser/technical-advice-parser';
import { VehicleDiagnosticParser } from 'src/infrastructure/service/query/parser/vehicle-diagnostic-parser';
import { VehicleReviewParser } from 'src/infrastructure/service/query/parser/vehicle-review-parser';
import { VehicleUtil } from 'src/infrastructure/util/vehicle.util';

@Injectable()
export class QueryResponseParser {
  private static readonly QUERY_STATUS: Record<QueryResponseStatus, QueryStatus> = {
    SUCCESS: QueryStatus.SUCCESS,
    PARTIAL: QueryStatus.PARTIAL,
    PENDING: QueryStatus.PENDING,
    FAILED: QueryStatus.FAILURE,
    REPROCESSING: QueryStatus.REPROCESSING,
  };

  constructor(private readonly _vehicleUtil: VehicleUtil) {}

  parseQueryResponse(
    { queryRef, executionTime, status, response, keys }: QueryResponseDto,
    reprocessInfos: ReprocessInfosDto,
  ): Partial<QueryDto> {
    return {
      id: queryRef,
      status:
        status === QueryResponseStatus.SUCCESS || status === QueryResponseStatus.PARTIAL
          ? QueryStatus.SUCCESS
          : QueryStatus.FAILURE,
      queryKeys: {
        plate: keys?.plate,
        chassis: keys?.chassis,
        engine: keys?.engine,
      },
      executionTime: executionTime,
      queryStatus: this._getQueryStatus(status, reprocessInfos?.status),
      responseJson: response && {
        chassi: response?.chassis,
        placa: response?.plate,
        renavam: response?.renavam,
        numMotor: response?.engine,
        marcaImagem: this._vehicleUtil.getBrandImgSrc(response?.aggregate?.brand),

        ...AggregateParser.parse(response?.aggregate, response?.nationalBase, response?.stateBase),
        cotacaoSeguro: InsuranceQuotesParser.parse(response?.insuranceQuotes, response?.fipeData),
        opiniaoDoDono: OwnerOpinionParser.parse(response?.ownerOpinion),
        analiseRisco: TechnicalAdviceParser.parse(response?.technicalAdvice),
        anuncio: PartnerInformationsParser.parseQueryAd(response?.partnerInformations),
        baseEstadual: StateBaseParser.parse(response?.stateBase),
        baseNacional: NationalBaseParser.parse(response?.nationalBase),
        comparativoEspecificacoes: this._parseComparativeAndOwnerOpinion(response?.comparativeAndOwnerOpinion),
        diagnosticoDoVeiculo: VehicleDiagnosticParser.parse(response?.vehicleDiagnostic),
        gravame: GravameParser.parse(response?.gravame),
        debitosMultas: DebstAndFinesParser.parse(response?.debtsAndFines),
        historicoKm: KmBaseParser.parse(response?.kmBase),
        indicioSinistro: SignOfAccidentParser.parse(response?.signOfAccident),
        leilao: AuctionParser.parse(response?.auction, response?.auctionScore),
        proprietarios: OwnerHistoryParser.parse(response?.ownerHistory),
        rouboFurto: RobberyAndTheftParser.parse(response?.robberyAndTheft),
        recall: RecallParser.parse(response?.recall),
        localizadorAgregados: AggregateLocatorParser.parse(response?.aggregateLocator),
        renajud: RenajudParser.parse(response?.renajud),
        custoMedio: AverageCostParser.parse(response?.averageCost),
        avaliacaoVeicular: VehicleReviewParser.parse(response?.review),

        ...SpecialDataSheetParser.parse({
          accessories: response?.accessories,
          basicPack: response?.basicPack,
          basicVehicle: response?.basicVehicle,
          datasheet: response?.datasheet,
          revision: response?.revision,
        }),
      },
    };
  }

  parseCreditQueryResponse({ queryRef, status, keys }: QueryResponseDto): Partial<QueryDto> {
    return {
      id: queryRef,
      status: status === QueryResponseStatus.SUCCESS ? QueryStatus.SUCCESS : QueryStatus.FAILURE,
      queryKeys: {
        plate: keys?.plate,
        chassis: keys?.chassis,
        engine: keys?.engine,
      },
      queryStatus: status === QueryResponseStatus.SUCCESS ? QueryStatus.SUCCESS : QueryStatus.FAILURE,
    };
  }

  private _getQueryStatus(status: QueryResponseStatus, reprocessStatus: ReprocessQueryStatus): QueryStatus {
    if (reprocessStatus === 'PROCCESSING') {
      return QueryStatus.REPROCESSING;
    }

    return QueryResponseParser.QUERY_STATUS[status];
  }

  private _parseComparativeAndOwnerOpinion(
    comparativeAndOwnerOpinion: ComparativeAndOwnerOpinionVo,
  ): QueryComparativeVo {
    if (comparativeAndOwnerOpinion === null || comparativeAndOwnerOpinion === undefined)
      return {
        opinioesDoDono: [],
        veiculoComparativo: [],
      };

    const queryComparatives: ReadonlyArray<QueryVehicleComparativeVo> = this._parseComparative(
      comparativeAndOwnerOpinion?.comparative,
    );

    const queryOwnerOpinion: ReadonlyArray<QueryCompativeOwnerOpinionVo> =
      QueryResponseParser._parseComparativeOwnerOpinion(comparativeAndOwnerOpinion.ownerOpinion);

    return {
      opinioesDoDono: queryOwnerOpinion,
      veiculoComparativo: queryComparatives,
    };
  }

  private _parseComparative(comparatives: ReadonlyArray<ComparativeVo>): ReadonlyArray<QueryVehicleComparativeVo> {
    if (!Array.isArray(comparatives)) return null;
    const queryVehicleComparative: ReadonlyArray<QueryVehicleComparativeVo> = comparatives.map(
      (comparative: ComparativeVo) => ({
        ano: comparative.year?.toString(),
        descricao: {
          posicao: comparative?.depreciation?.position?.toString(),
          seisMesesPorcentagemDeIdade: comparative?.depreciation?.sixMonthsPercentage?.toString(),
        },
        equipamentos: QueryResponseParser._parseComparativeEquipments(comparative?.equipments),
        espesificacoes: QueryResponseParser._parseComparativeSpecs(comparative?.specs),
        fipeId: comparative.fipeId,
        marca: comparative.brand,
        marcaImagem: this._vehicleUtil.getBrandImgSrc(comparative?.brand), // TODO - ver se funciona
        modelo: comparative.model,
        partes: QueryResponseParser._parseComparativeParts(comparative?.parts),
        planoDeRevisao: {
          posicao: comparative?.revisionPlan?.position?.toString(),
          primeiraRevisaoPreco: comparative?.revisionPlan?.firstSixRevisionTotalPrice?.toString(),
        },

        posicaoGeral: comparative.overallPosition?.toString(),
        preco: {
          posicao: comparative?.price?.position?.toString(),
          preco: comparative?.price?.price?.toString(),
        },
      }),
    );
    return queryVehicleComparative;
  }

  private static _parseComparativeOwnerOpinion(
    opinions: ReadonlyArray<OwnerOpinionVo>,
  ): ReadonlyArray<QueryCompativeOwnerOpinionVo> {
    if (!Array.isArray(opinions)) return [];
    return opinions?.map((opinion: OwnerOpinionVo) => ({
      brakes: opinion.brakes?.toString(),
      cambium: opinion.cambium?.toString(),
      city_consumption: opinion.cityConsumption?.toString(),
      comfort: opinion.comfort?.toString(),
      cost_benefit: opinion.costBenefit?.toString(),
      internal_space: opinion.internalSpace?.toString(),
      performance: opinion.performance?.toString(),
      road_consumption: opinion.roadConsumption?.toString(),
      stability: opinion.stability?.toString(),
      suspension: opinion.suspension?.toString(),
      total_score: opinion.totalScore?.toString(),
      trunk: opinion.trunk?.toString(),
    }));
  }

  private static _parseComparativeSpecs(
    specs: ReadonlyArray<ComparativeSpecData>,
  ): ReadonlyArray<QueryComparativeSpecData> {
    if (!Array.isArray(specs)) return [];

    return specs?.map((spec: ComparativeSpecData) => ({
      descricao: spec.specificationDescription,
      posicao: spec.position?.toString(),
      valor: spec.value?.toString(),
    }));
  }

  private static _parseComparativeEquipments(
    equipments: ReadonlyArray<ComparativeEquipmentData>,
  ): ReadonlyArray<QueryComparativeEquipmentData> {
    if (!Array.isArray(equipments)) return [];
    return equipments?.map((equipment: ComparativeEquipmentData) => ({
      descricao: equipment?.description,
      posicao: equipment?.position?.toString(),
      status: equipment?.itemStatus,
    }));
  }

  private static _parseComparativeParts(
    parts: ReadonlyArray<ComparativePartData>,
  ): ReadonlyArray<QueryComparativePartData> {
    if (!Array.isArray(parts)) return [];
    return parts?.map((part: ComparativePartData) => ({
      parte: {
        id: part?.part?.id,
        descricao: part?.part?.description,
      },
      posicao: part.position?.toString(),
      preco: part?.price?.toString(),
    }));
  }
}
