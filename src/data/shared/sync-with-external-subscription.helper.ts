import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import {
  NoSubscriptionFoundDomainError,
  NotFoundMyCarDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';

export type SyncedMyCarAndSubscription = readonly [Partial<SubscriptionDto>, Partial<MyCarProductDto>];
export type FetchedMyCarAndSubscription = readonly [SubscriptionDto, MyCarProductDto];

type FetchErrors = NoSubscriptionFoundDomainError | NotFoundMyCarDomainError;
export type SyncedSubscriptionAndMyCar = readonly [SubscriptionDto, MyCarProductDto];

@Injectable()
export class SyncWithExternalSubscriptionHelper {
  constructor(
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _myCarProductRepository: MyCarProductRepository,
  ) {}

  /**
   * Validates subscription and pipes external action subscription IO into subscription internal state syncing
   * Also syncs my car product with internal subscription if correlated found
   */
  applyActionExternalSubscriptionAndSync(
    subscription: SubscriptionDto,
    action: EitherIO<UnknownDomainError, ExternalSubscriptionDto>,
  ): EitherIO<UnknownDomainError, SubscriptionDto> {
    const subscriptionId: string = subscription.id;
    return action
      .filter(
        UnknownDomainError.toFn(),
        (externalSubscription: ExternalSubscriptionDto) => externalSubscription.idempotence === subscriptionId,
      )
      .map((externalSubscription: ExternalSubscriptionDto) => {
        const partialSyncedSubscription: Partial<SubscriptionDto> = this.syncSubscriptionBasedOnExternal(
          subscription,
          externalSubscription,
        );
        return partialSyncedSubscription !== null
          ? this._subscriptionRepository.updateById(subscription.id, partialSyncedSubscription)
          : subscription;
      })
      .tap(async (syncedSubscription: SubscriptionDto) =>
        // maybe is subscription is not a 'My Car'
        EitherIO.from(UnknownDomainError.toFn(), () =>
          this._myCarProductRepository.getBySubscriptionId(syncedSubscription.id),
        )
          .filter(NotFoundMyCarDomainError.toFn(), Boolean)
          .map(async (myCar: MyCarProductDto) => {
            const partialSyncedMyCar: Partial<MyCarProductDto> = this.syncMyCarBasedOnSubscription(
              syncedSubscription,
              myCar,
            );
            await this._myCarProductRepository.updateById(myCar.id, partialSyncedMyCar);
          })
          .unsafeRun(),
      );
  }

  /**
   * Fetches subscription and pipes external action subscription IO into subscription internal state syncing
   * And syncs my car product with internal subscription, returning both
   */
  applyActionExternalSubscriptionAndSyncForMyCar(
    myCar: MyCarProductDto,
    subscription: SubscriptionDto,
    action: (subscription: SubscriptionDto) => EitherIO<UnknownDomainError, ExternalSubscriptionDto>,
    remapMyCar?: (myCar: Partial<MyCarProductDto>) => EitherIO<UnknownDomainError, Partial<MyCarProductDto>>,
  ): EitherIO<UnknownDomainError, SyncedSubscriptionAndMyCar> {
    return action(subscription)
      .filter(
        UnknownDomainError.toFn(),
        (externalSubscription: ExternalSubscriptionDto) => externalSubscription.idempotence === subscription.id,
      )
      .map((externalSubscription: ExternalSubscriptionDto) => {
        const partialSyncedSubscription: Partial<SubscriptionDto> = this.syncSubscriptionBasedOnExternal(
          subscription,
          externalSubscription,
        );
        return partialSyncedSubscription !== null
          ? this._subscriptionRepository.updateById(subscription.id, partialSyncedSubscription)
          : subscription;
      })
      .flatMap((syncedSubscription: SubscriptionDto) =>
        EitherIO.of(UnknownDomainError.toFn(), myCar)
          .map((myCar: MyCarProductDto) => this.syncMyCarBasedOnSubscription(syncedSubscription, myCar))
          .flatMap(remapMyCar || this._passthroughIO.bind(this))
          .map(async (partialSyncedMyCar: Partial<MyCarProductDto>) =>
            this._myCarProductRepository.updateById(myCar.id, partialSyncedMyCar),
          )
          .map((syncedMyCar: MyCarProductDto): SyncedSubscriptionAndMyCar => [syncedSubscription, syncedMyCar]),
      );
  }

  private _passthroughIO<Ty>(m: Ty): EitherIO<UnknownDomainError, Ty> {
    return EitherIO.of(UnknownDomainError.toFn(), m);
  }

  fetchSubscriptionAndMyCar(subscriptionId: string): EitherIO<FetchErrors, FetchedMyCarAndSubscription> {
    return EitherIO.from(
      (error: FetchErrors) => error,
      async () => {
        const subscription: SubscriptionDto = await this._subscriptionRepository.getById(subscriptionId);
        if (!subscription) throw new NoSubscriptionFoundDomainError();

        const myCar: MyCarProductDto = await this._myCarProductRepository.getBySubscriptionId(subscriptionId);
        if (!myCar || myCar.type !== MyCarProductTypeEnum.PREMIUM) throw new NotFoundMyCarDomainError();

        return [subscription, myCar];
      },
    );
  }

  syncMyCarBasedOnSubscription(
    syncedSubscription: Partial<SubscriptionDto>,
    myCar: MyCarProductDto,
  ): Partial<MyCarProductDto> {
    let toUpdate: Partial<MyCarProductDto> = {
      expiresAt: syncedSubscription.expiresAt,
    };

    switch (syncedSubscription.status) {
      case SubscriptionStatus.ACTIVE:
        toUpdate = {
          ...toUpdate,
          deactivatedAt: null,
          status: MyCarProductStatusEnum.ACTIVE,
        };
        break;

      case SubscriptionStatus.CANCELED:
        toUpdate = {
          ...toUpdate,
          deactivatedAt: myCar.deactivatedAt ? undefined : syncedSubscription.deactivatedAt,
          status: MyCarProductStatusEnum.EXCLUDED,
        };
        break;

      case SubscriptionStatus.CANCELLING:
        toUpdate = {
          ...toUpdate,
          status: MyCarProductStatusEnum.EXCLUDING,
        };
        break;

      case SubscriptionStatus.INACTIVE:
        toUpdate = {
          ...toUpdate,
          deactivatedAt: myCar.deactivatedAt ? undefined : syncedSubscription.deactivatedAt,
          status: MyCarProductStatusEnum.DEACTIVE,
        };
        break;

      default:
        // should not happen
        throw Error('invalid');
    }

    return toUpdate;
  }

  syncSubscriptionBasedOnExternal(
    currentSubscription: SubscriptionDto,
    externalSubscription: ExternalSubscriptionDto,
  ): Partial<SubscriptionDto> {
    let toUpdate: Partial<SubscriptionDto> | null = {
      expiresAt: externalSubscription.expiresAt,
      nextChargeAt: externalSubscription.chargeAt,
    };

    switch (externalSubscription.status) {
      case ExternalSubscriptionStatus.ACTIVE:
        toUpdate = {
          ...toUpdate,
          deactivatedAt: null,
          status: SubscriptionStatus.ACTIVE,
        };
        break;

      case ExternalSubscriptionStatus.CANCELLED:
        toUpdate = {
          ...toUpdate,
          status: SubscriptionStatus.CANCELLING,
        };
        break;

      case ExternalSubscriptionStatus.EXPIRED:
        toUpdate = {
          ...toUpdate,
          status: SubscriptionStatus.INACTIVE,
        };
        break;

      case ExternalSubscriptionStatus.DUED:
        toUpdate = {
          ...toUpdate,
          status: SubscriptionStatus.INACTIVE,
          deactivatedAt: new Date().toISOString(),
        };
        break;

      case ExternalSubscriptionStatus.TERMINATED:
        toUpdate = {
          ...toUpdate,
          status: SubscriptionStatus.CANCELED,
          deactivatedAt: new Date().toISOString(),
        };
        break;

      // should never happen
      case ExternalSubscriptionStatus.PENDING:
        toUpdate = {
          ...toUpdate,
          status: SubscriptionStatus.PENDING,
        };
        break;
    }

    return Object.keys(toUpdate).some((key: keyof typeof toUpdate) => currentSubscription[key] !== toUpdate[key])
      ? toUpdate
      : null;
  }
}
