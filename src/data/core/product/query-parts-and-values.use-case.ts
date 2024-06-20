import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarQueryPartsAndValues } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import {
  QueryPartsAndValuesDomain,
  QueryPartsAndValuesIO,
} from 'src/domain/core/product/query-parts-and-values.domain';
import { BasicPackRecord, BasicPackVo } from 'src/domain/value-object/basic-pack.vo';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class QueryPartsAndValuesUseCase implements QueryPartsAndValuesDomain {
  private static readonly TEMPLATE_QUERY: string = '2';

  constructor(private readonly _helper: MyCarsQueryHelper) {}

  execute(userId: string, carId: string): QueryPartsAndValuesIO {
    return this._helper.getCar(userId, carId).flatMap(this._processQuery());
  }

  private _processQuery(): (carDto: MyCarProductWithUserDto) => QueryPartsAndValuesIO {
    return (carDto: MyCarProductWithUserDto) => {
      return EitherIO.of(UnknownDomainError.toFn(), carDto)
        .map(this._helper.requestQuery(QueryPartsAndValuesUseCase.TEMPLATE_QUERY))
        .map(this._helper.getResponse(30_000))
        .filter(ProviderUnavailableDomainError.toFn(), this._helper.isValidQuery())
        .filter(ProviderNoDataForSelectedVersion.toFn(), this._canBeParsed(carDto))
        .map(this._parseResponse(carDto));
    };
  }

  private _filterByFipe(basicPack: ReadonlyArray<BasicPackVo>, fipeId: number): ReadonlyArray<BasicPackVo> {
    return basicPack.filter((item: BasicPackVo) => item.fipeId === fipeId);
  }

  private _canBeParsed(carDto: MyCarProductWithUserDto) {
    return ({ response }: QueryResponseDto): boolean => {
      const fipeId: number = Number(carDto?.keys?.fipeId) || -1;
      const basicPack: ReadonlyArray<BasicPackVo> = response.basicPack ?? [];
      const items: ReadonlyArray<BasicPackVo> = this._filterByFipe(basicPack, fipeId);
      return Array.isArray(items) && items.length > 0;
    };
  }

  private _parseResponse(carDto: MyCarProductWithUserDto) {
    return ({ response }: QueryResponseDto): MyCarQueryPartsAndValues => {
      const fipeId: number = Number(carDto?.keys?.fipeId) || -1;
      const basicPack: ReadonlyArray<BasicPackVo> = response.basicPack ?? [];

      return {
        parts: basicPack
          .filter((item: BasicPackVo) => item.fipeId === fipeId)
          .flatMap((item: BasicPackVo) => item.records)
          .map((item: BasicPackRecord) => ({
            complement: item.complement,
            part: item.nicknameDescription,
            valueInCents: this._helper.toCents(item.value),
          })),
      };
    };
  }
}
