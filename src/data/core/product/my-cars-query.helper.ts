import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  QueryRequestService,
  RequestQueryServiceInput,
} from 'src/domain/_layer/infrastructure/service/query-request.service';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';

@Injectable()
export class MyCarsQueryHelper {
  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  getCar(userId: string, carId: string): EitherIO<UnknownDomainError | CarNotFoundError, MyCarProductWithUserDto> {
    const promise: Promise<MyCarProductWithUserDto> = this._myCarProductRepository.getByUserIdAndCarId(userId, carId);

    return EitherIO.from(UnknownDomainError.toFn(), () => promise)
      .filter(CarNotFoundError.toFn(), Boolean)
      .filter(CarSubscriptionDeactivatedFoundError.toFn(), this._mayQuery());
  }

  requestQuery(templateQuery: string) {
    return async ({ keys, email, name }: MyCarProductWithUserDto): Promise<string> => {
      const randomicNumber: number = Math.random() + Date.now();
      const queryRef: string = btoa(randomicNumber.toString());
      const inputQuery: RequestQueryServiceInput = {
        queryRef: queryRef,
        templateQueryRef: templateQuery,
        keys: {
          plate: keys.plate,
          chassis: keys.chassis,
          brand: keys.brand,
          model: keys.model,
          fipeId: keys.fipeId,
          fipeIds: [keys.fipeId],
          modelYear: keys.modelYear,
          year: keys.modelYear,
          engine: keys.engineNumber,
          engineCapacity: keys.engineCapacity,
          modelBrandCode: Number(keys.brandModelCode),
        },
        support: {
          userName: name,
          userEmail: email,
        },
      };

      await this._queryRequestService.requestQuery(inputQuery);
      return queryRef;
    };
  }

  getResponse(requestTimeout?: number) {
    return async (queryRef: string): Promise<QueryResponseDto> => {
      return await this._queryRequestService.getAsyncQueryByReference(queryRef, requestTimeout);
    };
  }

  isValidQuery(): (dto: QueryResponseDto) => boolean {
    return (dto: QueryResponseDto) => dto && dto.status === QueryResponseStatus.SUCCESS;
  }

  toCents(value: number): number {
    return this._currencyUtil.numToCurrency(value).toInt();
  }

  private _mayQuery(): (dto: MyCarProductWithUserDto) => boolean {
    return ({ status }: MyCarProductWithUserDto) =>
      status === MyCarProductStatusEnum.ACTIVE || status === MyCarProductStatusEnum.EXCLUDING;
  }
}
