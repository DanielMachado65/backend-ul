import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { QueryKeys } from 'src/domain/_entity/query.entity';
import { CarNotFoundError, UnknownDomainError } from 'src/domain/_entity/result.error';
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
  NotifyMyCarsBy,
  SendAlertOnQueryDomain,
  SendAlertOnQueryIO,
} from 'src/domain/core/product/send-alert-on-query.domain';

@Injectable()
export class SendAlertOnQueryUseCase implements SendAlertOnQueryDomain {
  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _notificationServiceGen: NotificationServiceGen,
    private readonly _notificationInfraService: NotificationInfrastructure,
  ) {}

  private _nofifyBy() {
    return (myCars: ReadonlyArray<MyCarProductWithUserDto>): NotifyMyCarsBy => {
      const carsToNotify: ReadonlyArray<MyCarProductWithUserDto> = myCars.filter(
        (myCar: MyCarProductWithUserDto) => myCar?.onQueryConfig?.isEnabled === true,
      );

      const byEmail: ReadonlyArray<MyCarProductWithUserDto> = carsToNotify.filter((myCar: MyCarProductWithUserDto) =>
        myCar?.onQueryConfig?.notificationChannels?.includes(NotificationChannel.EMAIL),
      );

      const byApp: ReadonlyArray<MyCarProductWithUserDto> = carsToNotify.filter((myCar: MyCarProductWithUserDto) =>
        myCar?.onQueryConfig?.notificationChannels?.includes(NotificationChannel.PUSH),
      );

      return { byEmail, byApp };
    };
  }

  private _sendByEmail() {
    return ({ byEmail }: NotifyMyCarsBy): void => {
      byEmail.forEach(async (myCar: MyCarProductWithUserDto) =>
        this._notificationServiceGen.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_ALERT, {
          email: myCar.email,
          name: myCar.name,
          plate: myCar.keys.plate,
        }),
      );
    };
  }

  private _sendByApp() {
    return ({ byApp }: NotifyMyCarsBy): void => {
      byApp.forEach((myCar: MyCarProductWithUserDto) => {
        this._notificationInfraService.dispatch(NotificationIdentifier.QUERY_ALERT, [{ subscriberId: myCar.userId }], {
          userUF: myCar.userUF,
        });
      });
    };
  }

  send(userId: string, keys: QueryKeys): SendAlertOnQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => {
      return this._myCarProductRepository.getActiveByKeys(userId, keys);
    })
      .filter(CarNotFoundError.toFn(), (myCar: ReadonlyArray<MyCarProductWithUserDto>) => myCar.length > 0)
      .map(this._nofifyBy())
      .tap(this._sendByEmail())
      .tap(this._sendByApp())
      .map(() => null);
  }
}
