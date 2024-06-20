import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { DataNotFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { VehicleEntity } from 'src/domain/_entity/vehicle.entity';
import {
  KeyValueReviewDatasheetBlock,
  OwnerReviewQueryResult,
  OwnerReviewQueryResultMainData,
  ReviewDatasheetBlocks,
  SeriesReviewDatasheetBlock,
  SeriesReviewDatasheetBlockItem,
} from 'src/domain/_layer/data/dto/owner-review-query-result.dto';
import {
  OwnerReviewModel,
  OwnerReviewModelRepository,
} from 'src/domain/_layer/infrastructure/repository/owner-review-model.repository';
import { VehicleVersionService, VersionAbout } from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import {
  GetOwnerReviewQueryDomain,
  GetOwnerReviewQueryIO,
} from 'src/domain/support/owner-review/get-owner-review-query.domain';
import { AccessoryCategory, AccessoryRecord, AccessoryVo } from 'src/domain/value-object/accessory.vo';
import { DatasheetRecord, DatasheetRecordSpec } from 'src/domain/value-object/datasheet.vo';
import { FipeHistoryRecord, FipePriceHistoryVo } from 'src/domain/value-object/fipe-data.vo';
import { ModelDataVo } from 'src/domain/value-object/model-data.vo';
import { RevisionRecord, RevisionVo } from 'src/domain/value-object/revision.vo';
import { StringUtil } from 'src/infrastructure/util/string.util';

@Injectable()
export class GetOwnerReviewQueryUseCase implements GetOwnerReviewQueryDomain {
  constructor(
    private readonly _ownerReviewModelRepository: OwnerReviewModelRepository,
    private readonly _vehicleVersionService: VehicleVersionService,
  ) {}

  static priceBRLFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' });

  getOwnerReviewQueryByVehicle(fipeId: string, modelYear: number): GetOwnerReviewQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._ownerReviewModelRepository.getModel(fipeId, modelYear))
      .filter(DataNotFoundDomainError.toFn(), Boolean)
      .flatMap((ownerReviewModel: OwnerReviewModel) =>
        EitherIO.from(UnknownDomainError.toFn(), () => this._vehicleVersionService.getVersionAbout(fipeId, modelYear))
          .catch(() => Either.right(null))
          .flatMap((about: VersionAbout | null) => this._processData(ownerReviewModel, about)),
      );
  }

  private _processData(ownerReviewModel: OwnerReviewModel, about: VersionAbout | null): GetOwnerReviewQueryIO {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    return EitherIO.from(UnknownDomainError.toFn(), async (): Promise<OwnerReviewQueryResult> => {
      const response: Partial<VehicleEntity> = ownerReviewModel.vehicle;
      const datasheetRecords: ReadonlyArray<DatasheetRecord> = response.datasheet?.[0]?.records || [];
      const accessories: AccessoryVo | null = response.accessories?.[0] || null;

      /** Datasheet */
      const recordBlocks: ReadonlyArray<KeyValueReviewDatasheetBlock> = datasheetRecords.map(
        (record: DatasheetRecord) => ({
          key: record.description,
          type: 'key-value',
          items: record.specs.map((spec: DatasheetRecordSpec) => ({
            key: spec.property,
            value: spec.value,
          })),
        }),
      );

      const accessoryBlocks: ReadonlyArray<SeriesReviewDatasheetBlock> =
        accessories?.acessoryCategories
          ?.filter((category: AccessoryCategory) => category.id !== '0')
          ?.map(
            (category: AccessoryCategory): SeriesReviewDatasheetBlock => ({
              key: `Equipamentos de ${StringUtil.capitalizeFirstLetter(category.description.toLowerCase())}`,
              type: 'series',
              items: accessories.records
                .filter((accessory: AccessoryRecord) => accessory.categoryId === category.id)
                .map(
                  (accessory: AccessoryRecord): SeriesReviewDatasheetBlockItem => ({
                    key: accessory.description,
                    type: accessory.isSeries ? 'available' : 'unable',
                  }),
                ),
            }),
          ) || [];

      const blocks: ReadonlyArray<ReviewDatasheetBlocks> = [...recordBlocks, ...accessoryBlocks];

      /** Main data */
      const model: ModelDataVo = response.model;
      const revision: ReadonlyArray<RevisionVo> = response.revision;
      const fipeHistory: ReadonlyArray<FipePriceHistoryVo> = response.fipeHistory;

      // Fipe history
      const allHistory: ReadonlyArray<FipeHistoryRecord> = (fipeHistory || []).flatMap(
        (fipe: FipePriceHistoryVo) => fipe.history,
      );
      const averageModelPrice: number =
        allHistory.reduce((total: number, period: FipeHistoryRecord) => total + period.price, 0) / allHistory.length;

      // Revision
      const revisionRecords: ReadonlyArray<RevisionRecord> = (revision || [])
        .flatMap((version: RevisionVo) => version.records)
        .filter((record: RevisionRecord) => record.kilometers > 100_000);
      const averageRevisionPrice: number =
        revisionRecords.reduce((total: number, record: RevisionRecord) => record.fullPrice + total, 0) /
        datasheetRecords.length;

      const mainVehicleData: ReadonlyArray<OwnerReviewQueryResultMainData | null> = [
        (model || about) && { key: 'Marca', value: model?.brand || about.brandName },
        (model || about) && { key: 'Modelo', value: model?.model || about.modelName },
        (model || about) && {
          key: 'Ano Modelo',
          value: model?.modelYear?.toString() || about?.modelYear?.toString() || '-',
        },
        about && { key: 'Versão', value: about.versionName || '-' },
        model && { key: 'Segmento', value: model.segmentation },
        model && { key: 'Procedência', value: model.origin },
        model && { key: 'Tipo do Veículo', value: model.vehicleType },
        model && { key: 'Lugares', value: model.passengerCapacity?.toString() || '-' },
        fipeHistory && {
          key: 'Média de preço',
          value: GetOwnerReviewQueryUseCase.priceBRLFormatter.format(averageModelPrice),
        },
        revision &&
          !isNaN(averageRevisionPrice) && {
            key: 'Plano de Revisão',
            value: GetOwnerReviewQueryUseCase.priceBRLFormatter.format(averageRevisionPrice),
          },
      ].filter(Boolean);

      return {
        blocks,
        mainVehicleData,
        images: [],
        review: {
          blogPosts: response.review?.blogPosts || [],
          videoPosts: response.review?.videoPosts || [],
        },
      };
    });
  }
}
