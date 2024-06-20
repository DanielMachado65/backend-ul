import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { MyCarProductTypeEnum, RevisionConfig } from 'src/domain/_entity/my-car-product.entity';
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
  SendAlertRevisionIO,
  SendAlertRevisionPlanDomain,
} from 'src/domain/core/product/send-alert-revision-plan.domain';
import { RevisionPlanUtils } from 'src/infrastructure/util/revision-plan.util';
import {
  RevisionPlanDto,
  RevisionPlanItemDto,
  RevisionPlanNotifyDto,
} from 'src/domain/_layer/data/dto/revision-plan.dto';
import { CurrencyUtil } from 'src/infrastructure/util/currency.util';
import * as dayjs from 'dayjs';
import { MyCarsQueryHelper } from './my-cars-query.helper';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';

@Injectable()
export class SendAlertRevisionPlanUseCase implements SendAlertRevisionPlanDomain {
  private readonly _notificationDays: ReadonlyArray<number> = [0, 7, 15, 30];
  public readonly REVISION_PLAN_CODE: string = '8810';

  constructor(
    private readonly _myCarsQueryHelper: MyCarsQueryHelper,
    private readonly _revisionPlanUtils: RevisionPlanUtils,
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _notificationServiceGen: NotificationServiceGen,
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _currencyUtil: CurrencyUtil,
  ) {}

  execute(): SendAlertRevisionIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this.getAllCarsWithRevisionPlanEnabled())
      .tap((myCarProduct: ReadonlyArray<MyCarProductWithUserDto>) =>
        myCarProduct.map((myCar: MyCarProductWithUserDto) => this._forEachCar(myCar)),
      )
      .map(() => true);
  }

  async getAllCarsWithRevisionPlanEnabled(): Promise<ReadonlyArray<MyCarProductWithUserDto>> {
    try {
      return await this._myCarProductRepository.getAllIncludeUser({
        'revisionConfig.isEnabled': true,
        status: 'active',
        type: MyCarProductTypeEnum.PREMIUM,
      });
    } catch (error) {
      console.error('error', error);
      return null;
    }
  }

  _forEachCar(myCar: MyCarProductWithUserDto): Promise<RevisionPlanNotifyDto> {
    const { revisionConfig }: { readonly revisionConfig: RevisionConfig } = myCar;

    if (!revisionConfig || !revisionConfig.isEnabled) {
      return null;
    }

    return EitherIO.from(UnknownDomainError.toFn(), () => myCar)
      .map((myCar: MyCarProductWithUserDto) => this._getRevision(myCar))
      .map((revisionPlan: RevisionPlanDto) => this._checkRevision(revisionConfig, revisionPlan))
      .tap((revisionPlanNotifyData: RevisionPlanNotifyDto) =>
        this._notify(revisionConfig, myCar, revisionPlanNotifyData),
      )
      .unsafeRun();
  }

  private _notify(
    revisionConfig: RevisionConfig,
    myCar: MyCarProductWithUserDto,
    revisionPlanNotifyData: RevisionPlanNotifyDto,
  ): void {
    this._notificationDays.forEach((days: number) => {
      if (this._shouldNotify(revisionPlanNotifyData, revisionConfig, days)) {
        const dateToSend: Date = dayjs(revisionPlanNotifyData.estimatedRevisionDate).add(days, 'days').toDate();
        this._sendNotifications(myCar, {
          ...revisionPlanNotifyData,
          estimatedRevisionDate: dateToSend,
        });
      }
    });
  }

  private _shouldNotify(
    { estimatedRevisionDate, estimatedKilometersRevision }: RevisionPlanNotifyDto,
    revisionConfig: RevisionConfig,
    daysBefore: number,
  ): boolean {
    switch (daysBefore) {
      case 0:
        return this._revisionPlanUtils.isToday(estimatedRevisionDate);
      case 7:
        return (
          revisionConfig.shouldNotify7DaysBefore &&
          this._revisionPlanUtils.is7DaysBeforeRevision(
            estimatedKilometersRevision,
            revisionConfig.mileageKm,
            revisionConfig.mileageKmMonthly,
          )
        );
      case 15:
        return (
          revisionConfig.shouldNotify15DaysBefore &&
          this._revisionPlanUtils.is15DaysBeforeRevision(
            estimatedKilometersRevision,
            revisionConfig.mileageKm,
            revisionConfig.mileageKmMonthly,
          )
        );
      case 30:
        return (
          revisionConfig.shouldNotify30DaysBefore &&
          this._revisionPlanUtils.is30DaysBeforeRevision(
            estimatedKilometersRevision,
            revisionConfig.mileageKm,
            revisionConfig.mileageKmMonthly,
          )
        );
      default:
        return false;
    }
  }

  private _sendNotifications(
    myCar: MyCarProductWithUserDto,
    { estimatedRevisionDate, fullPriceFormat }: RevisionPlanNotifyDto,
  ): void {
    if (this._isEmailEnabled(myCar.revisionConfig)) {
      this._sendByEmail(myCar, { estimatedRevisionDate, fullPriceFormat });
    }
    if (this._isAppEnabled(myCar.revisionConfig)) {
      this._sendByApp(myCar, { estimatedRevisionDate, fullPriceFormat });
    }
  }

  private async _getRevision(myCar: MyCarProductWithUserDto): Promise<RevisionPlanDto | void> {
    return EitherIO.of(ProviderUnavailableDomainError.toFn(), myCar)
      .map(this._myCarsQueryHelper.requestQuery(this.REVISION_PLAN_CODE))
      .map(this._myCarsQueryHelper.getResponse())
      .map(this._parseResponse())
      .unsafeRun();
  }

  private _checkRevision(revisionConfig: RevisionConfig, revisionPlan: RevisionPlanDto): RevisionPlanNotifyDto {
    const { estimatedRevisionDate, estimatedFullPrice, estimatedKilometersRevision }: RevisionPlanNotifyDto =
      this._revisionPlanUtils.execute(revisionConfig, revisionPlan);

    return {
      estimatedRevisionDate,
      estimatedKilometersRevision,
      fullPriceFormat: this._formatPrice(estimatedFullPrice),
    };
  }

  private _isAppEnabled({ notificationChannels }: RevisionConfig): boolean {
    return notificationChannels.includes(NotificationChannel.PUSH);
  }

  private _isEmailEnabled({ notificationChannels }: RevisionConfig): boolean {
    return notificationChannels.includes(NotificationChannel.EMAIL);
  }

  private async _sendByEmail(
    myCar: MyCarProductWithUserDto,
    { fullPriceFormat, estimatedRevisionDate }: RevisionPlanNotifyDto,
  ): Promise<boolean> {
    return await this._notificationServiceGen.dispatch(
      NotificationTransport.EMAIL,
      NotificationType.QUERY_REVISION_PLAN,
      {
        email: myCar.email,
        name: myCar.name,
        plate: myCar.keys.plate,
        date: dayjs(estimatedRevisionDate).toISOString(),
        price: fullPriceFormat,
      },
    );
  }

  private async _sendByApp(
    myCar: MyCarProductWithUserDto,
    { fullPriceFormat, estimatedRevisionDate }: RevisionPlanNotifyDto,
  ): Promise<void> {
    return await this._notificationInfraService.dispatch(
      NotificationIdentifier.QUERY_REVISION_PLAN,
      [{ subscriberId: myCar.userId }],
      {
        id: myCar.carId,
        plate: myCar.keys.plate,
        date: dayjs(estimatedRevisionDate).toISOString(),
        price: fullPriceFormat,
      },
    );
  }

  private _formatPrice(price: number): string {
    if (!price) return '';

    return this._currencyUtil.numToCurrency(price).toFormat();
  }

  private _parseResponse() {
    return ({ response }: QueryResponseDto): RevisionPlanDto => {
      const items: ReadonlyArray<RevisionPlanItemDto> = response.revision?.map((item: unknown) => {
        return {
          kilometers: item['kilometers'],
          months: item['months'],
          fullPrice: item['fullPrice'],
        };
      });
      return { revisions: items ?? [] };
    };
  }
}
