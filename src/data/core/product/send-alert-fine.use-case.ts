import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { FineConfig, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel } from 'src/domain/_entity/notification.entity';
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
  MyCarQueryFine,
  MyCarQueryFineDebts,
  MyCarQueryFines,
} from 'src/domain/_layer/presentation/dto/my-car-queries.dto';
import { SendAlertFineDomain, SendAlertFineIO } from 'src/domain/core/product/send-alert-fine.domain';
import { QueryFinesHelper } from './helpers/query-fines.helper';
import { MyCarsQueryHelper } from './my-cars-query.helper';

@Injectable()
export class SendAlertFineUseCase implements SendAlertFineDomain {
  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _notificationServiceGen: NotificationServiceGen,
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _myCarsQueryHelper: MyCarsQueryHelper,
    private readonly _queryFinesHelper: QueryFinesHelper,
  ) {}

  execute(): SendAlertFineIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this.getAllCarsWithFineConfigEnabled())
      .tap((myCarProduct: ReadonlyArray<MyCarProductWithUserDto>) =>
        myCarProduct.map((myCar: MyCarProductWithUserDto) => this._forEachCar(myCar)),
      )
      .map(() => true);
  }

  async getAllCarsWithFineConfigEnabled(): Promise<ReadonlyArray<MyCarProductWithUserDto>> {
    try {
      return await this._myCarProductRepository.getAllIncludeUser({
        'fineConfig.isEnabled': true,
        status: 'active',
        type: MyCarProductTypeEnum.PREMIUM,
      });
    } catch (error) {
      console.error('error', error);
      return null;
    }
  }

  _forEachCar(myCar: MyCarProductWithUserDto): Promise<unknown> {
    const { fineConfig }: { readonly fineConfig: FineConfig } = myCar;

    if (!fineConfig || !fineConfig.isEnabled) {
      return null;
    }

    return EitherIO.from(UnknownDomainError.toFn(), () => myCar)
      .map((myCar: MyCarProductWithUserDto) => this._getFineDebts(myCar))
      .tap((myCarQueryFines: MyCarQueryFines) => this._notify(myCar, myCarQueryFines))
      .unsafeRun();
  }

  private _notify(myCar: MyCarProductWithUserDto, myCarQueryFines: MyCarQueryFines): void {
    if (this._hasFines(myCarQueryFines) && this._isEmailEnabled(myCar.fineConfig)) {
      this._sendByEmail(myCar, myCarQueryFines);
    }

    if (this._hasFines(myCarQueryFines) && this._isAppEnabled(myCar.fineConfig)) {
      this._sendByApp(myCar, myCarQueryFines);
    }
  }

  /**
   * consulta de multas
   */
  private _getFineDebts(myCar: MyCarProductWithUserDto): Promise<unknown> {
    return EitherIO.of(ProviderUnavailableDomainError.toFn(), myCar)
      .map(this._myCarsQueryHelper.requestQuery(QueryFinesHelper.QUERY_TEMPLATE))
      .map(this._myCarsQueryHelper.getResponse(45_000))
      .map(this._queryFinesHelper.parseResponse())
      .unsafeRun();
  }

  private _isAppEnabled({ notificationChannels }: FineConfig): boolean {
    return notificationChannels.includes(NotificationChannel.PUSH);
  }

  private _isEmailEnabled({ notificationChannels }: FineConfig): boolean {
    return notificationChannels.includes(NotificationChannel.EMAIL);
  }

  private _hasFines(myCarQueryFines: MyCarQueryFines): boolean {
    return myCarQueryFines.fines && myCarQueryFines.fines.length > 0;
  }

  private async _sendByEmail(myCar: MyCarProductWithUserDto, { fines, totalValue }: MyCarQueryFines): Promise<boolean> {
    return await this._notificationServiceGen.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_FINE, {
      email: myCar.email,
      name: myCar.name,
      plate: myCar.keys.plate,
      description: this._createListFines(fines),
      price: totalValue,
    });
  }

  private async _sendByApp(myCar: MyCarProductWithUserDto, myCarQueryFines: MyCarQueryFines): Promise<void> {
    const { totalValue }: MyCarQueryFines = myCarQueryFines;

    return await this._notificationInfraService.dispatch(
      NotificationIdentifier.QUERY_FINE,
      [{ subscriberId: myCar.userId }],
      {
        id: myCar.carId,
        plate: myCar.keys.plate,
        description: this._getSummary(myCarQueryFines),
        price: totalValue,
      },
    );
  }

  private _getSummary({ fines, totalValue }: MyCarQueryFines): string {
    return `Você possui ${fines.length} multa(s) no valor total de ${totalValue}`;
  }

  private _createListFines(fines: ReadonlyArray<MyCarQueryFine>): string {
    return fines.map((fine: MyCarQueryFine) => this._concatDebits(fine.debits)).join('\n');
  }

  private _concatDebits(debits: ReadonlyArray<MyCarQueryFineDebts>): string {
    return debits.map((debit: MyCarQueryFineDebts) => debit.description).join('\n');
  }
}
