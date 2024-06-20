import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarQueryRevisionPlan } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { QueryRevisionPlanDomain, QueryRevisionPlanIO } from 'src/domain/core/product/query-revision-plan.domain';
import { RevisionChangedPartData, RevisionRecord, RevisionVo } from 'src/domain/value-object/revision.vo';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class QueryRevisionPlanUseCase implements QueryRevisionPlanDomain {
  private static readonly TEMPLATE_QUERY: string = '999';

  constructor(private readonly _currencyUtil: CurrencyUtil, private readonly _helper: MyCarsQueryHelper) {}

  execute(userId: string, carId: string): QueryRevisionPlanIO {
    return this._helper.getCar(userId, carId).flatMap(this._processQuery());
  }

  private _processQuery(): (dto: MyCarProductWithUserDto) => EitherIO<UnknownDomainError, MyCarQueryRevisionPlan> {
    return (carDto: MyCarProductWithUserDto) => {
      return EitherIO.of(UnknownDomainError.toFn(), carDto)
        .map(this._helper.requestQuery(QueryRevisionPlanUseCase.TEMPLATE_QUERY))
        .map(this._helper.getResponse(60_000))
        .filter(ProviderUnavailableDomainError.toFn(), this._helper.isValidQuery())
        .filter(ProviderNoDataForSelectedVersion.toFn(), this._canBeParsed(carDto))
        .map(this._parseResponse(carDto));
    };
  }

  private _filterByFipe(revision: ReadonlyArray<RevisionVo>, fipeId: number): ReadonlyArray<RevisionVo> {
    return revision?.filter((revisionItem: RevisionVo) => revisionItem.fipeId === fipeId);
  }

  private _canBeParsed(carDto: MyCarProductWithUserDto) {
    return ({ response }: QueryResponseDto): boolean => {
      const fipeId: string = carDto.keys.fipeId;
      const items: ReadonlyArray<RevisionVo> = this._filterByFipe(response.revision, Number(fipeId));
      return Array.isArray(items) && items.length > 0;
    };
  }

  private _parseResponse(carDto: MyCarProductWithUserDto) {
    return ({ response }: QueryResponseDto): MyCarQueryRevisionPlan => {
      const fipeId: string = carDto.keys.fipeId;

      return {
        revisionPlans: this._filterByFipe(response.revision, Number(fipeId))
          ?.flatMap((revisionItem: RevisionVo) => revisionItem.records)
          ?.map((record: RevisionRecord) => ({
            monthsToRevision: record.months,
            kmToRevision: record.kilometers,
            totalPrice: this._formatPrice(record.fullPrice),
            partsToInspect: record.inspections.map((name: string) => ({ name })),
            partsToReplace: record.changedParts.map((part: RevisionChangedPartData) => ({
              name: part.description,
            })),
          })),
      };
    };
  }

  private _formatPrice(price: number): string {
    if (!price) return '';

    return this._currencyUtil.numToCurrency(price).toFormat();
  }
}
