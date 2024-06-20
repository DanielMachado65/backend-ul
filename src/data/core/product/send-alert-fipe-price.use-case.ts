import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { QueryResponseEntity } from 'src/domain/_entity/query-response.entity';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductWithUserDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { NotificationIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import {
  FipePriceWithMyCar,
  SendAlertFipePriceDomain,
  SendAlertFipePriceIO,
} from 'src/domain/core/product/send-alert-fipe-price.domain';
import { FipeHistoryRecord, FipePriceHistoryVo } from 'src/domain/value-object/fipe-data.vo';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class SendAlertFipePriceUseCase implements SendAlertFipePriceDomain {
  private static readonly TEMPLATE_QUERY: string = '939';

  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _notificationServiceGen: NotificationServiceGen,
    private readonly _myCarsQueryHelper: MyCarsQueryHelper,
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _notificationInfraService: NotificationInfrastructure,
  ) {}

  private _getAllFipePrice() {
    return async (): Promise<ReadonlyArray<MyCarProductWithUserDto>> => {
      return await this._myCarProductRepository.getAllIncludeUser({
        'priceFIPEConfig.isEnabled': true,
        type: MyCarProductTypeEnum.PREMIUM,
        status: MyCarProductStatusEnum.ACTIVE,
      });
    };
  }

  private _forEachCar() {
    return (myCar: MyCarProductWithUserDto): void => {
      EitherIO.of(ProviderUnavailableDomainError.toFn(), myCar)
        .map(this._myCarsQueryHelper.requestQuery(SendAlertFipePriceUseCase.TEMPLATE_QUERY))
        .map(this._myCarsQueryHelper.getResponse(20_000))
        .map(this._parseResponse())
        .tap(this._notificationByEmail(myCar))
        .tap(this._notificationByApp(myCar))
        .unsafeRun();
    };
  }

  private _parseResponse() {
    return ({ response }: QueryResponseEntity): FipePriceWithMyCar => {
      const fipePrice: FipePriceHistoryVo = response.fipeHistory[0];
      const fipeHistory: ReadonlyArray<FipeHistoryRecord> = fipePrice.history;
      const currencyMonthPrice: number = fipeHistory[0].price;
      const lastMonthPrice: number = fipeHistory[1].price;
      const currentPrice: string = this._currencyUtil.numToCurrency(currencyMonthPrice / 100).toFormat();
      const oldPrice: string = this._currencyUtil.numToCurrency(lastMonthPrice / 100).toFormat();
      const variationMonth: number = ((currencyMonthPrice - lastMonthPrice) / lastMonthPrice) * 100;
      const variationPercent: string = `${variationMonth.toFixed(2)}%`;

      return { currentPrice, oldPrice, variationPercent };
    };
  }

  private _notificationByEmail(myCar: MyCarProductWithUserDto) {
    return async (fipePrice: FipePriceWithMyCar): Promise<void> => {
      if (myCar?.priceFIPEConfig?.notificationChannels?.includes(NotificationChannel.EMAIL)) {
        this._notificationServiceGen.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_FIPE_PRICE, {
          email: myCar.email,
          name: myCar.name,
          plate: myCar.keys.plate,
          currentPrice: fipePrice.currentPrice,
          oldPrice: fipePrice.oldPrice,
        });
      }
    };
  }

  private _notificationByApp(myCar: MyCarProductWithUserDto) {
    return async (fipePrice: FipePriceWithMyCar): Promise<void> => {
      if (myCar?.priceFIPEConfig?.notificationChannels?.includes(NotificationChannel.PUSH)) {
        this._notificationInfraService.dispatch(
          NotificationIdentifier.QUERY_FIPE_PRICE,
          [{ subscriberId: myCar.userId }],
          {
            currentPrice: fipePrice.currentPrice,
            variationPercent: fipePrice.variationPercent,
            carId: myCar.carId,
            plate: myCar.keys.plate,
          },
        );
      }
    };
  }

  execute(): SendAlertFipePriceIO {
    return EitherIO.from(UnknownDomainError.toFn(), this._getAllFipePrice())
      .tap((myCarProduct: ReadonlyArray<MyCarProductWithUserDto>) => myCarProduct.forEach(this._forEachCar()))
      .map(() => true);
  }
}
