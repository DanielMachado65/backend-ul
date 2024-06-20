import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  SyncedSubscriptionAndMyCar,
  SyncWithExternalSubscriptionHelper,
} from 'src/data/shared/sync-with-external-subscription.helper';
import { MyCarProductStatusEnum } from 'src/domain/_entity/my-car-product.entity';
import {
  MyCarInvalidStateDomainError,
  NoSubscriptionFoundDomainError,
  NotFoundMyCarDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  ExcludeProductBoughtDomain,
  ExcludeProductBoughtIO,
} from 'src/domain/core/product/exclude-bought-product.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class ExcludeProductUseCase implements ExcludeProductBoughtDomain {
  public originalCnpj: string;

  constructor(
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _syncWithExternalSubscriptionHelper: SyncWithExternalSubscriptionHelper,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _envService: EnvService,
  ) {
    this.originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  excludeById(id: string, userId: string): ExcludeProductBoughtIO {
    return this._fetchMyCar(id, userId)
      .filter(
        MyCarInvalidStateDomainError.toFn(),
        (
          myCar: MyCarProductDto, // unnecessary
        ) =>
          myCar.status === MyCarProductStatusEnum.ACTIVE ||
          myCar.status === MyCarProductStatusEnum.DEACTIVE ||
          myCar.status === MyCarProductStatusEnum.EXCLUDING,
      )
      .map(async (myCar: MyCarProductDto) => {
        const subscription: SubscriptionDto = await this._subscriptionRepository.getById(myCar.subscriptionId);

        return {
          myCar,
          subscription,
        };
      })
      .flatMap(
        ({ myCar, subscription }: { readonly myCar: MyCarProductDto; readonly subscription: SubscriptionDto }) => {
          if (subscription)
            return this._syncWithExternalSubscriptionHelper
              .applyActionExternalSubscriptionAndSyncForMyCar(
                myCar,
                subscription,
                (subscription: SubscriptionDto) =>
                  EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
                    this._paymentGatewayService.cancelSubscription(subscription.gatewayRef, userId, this.originalCnpj),
                  ),
                (syncedMyCar: Partial<MyCarProductDto>) =>
                  EitherIO.of(UnknownDomainError.toFn(), {
                    ...syncedMyCar,
                    status: MyCarProductStatusEnum.EXCLUDED,
                  }),
              )
              .map(([, myCar]: SyncedSubscriptionAndMyCar) => myCar);
          else return this._updateMyCarStatus(myCar.id, MyCarProductStatusEnum.EXCLUDED);
        },
      );
  }

  private _fetchMyCar(
    myCarId: string,
    userId: string,
  ): EitherIO<UnknownDomainError | NoSubscriptionFoundDomainError, MyCarProductDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._myCarProductRepository.getByIdOwnedByUser(myCarId, userId),
    ).filter(NotFoundMyCarDomainError.toFn(), Boolean);
  }

  /**
   * Update the status of a MyCarProduct
   */
  private _updateMyCarStatus(
    myCarId: string,
    status: MyCarProductStatusEnum,
  ): EitherIO<MyCarInvalidStateDomainError, MyCarProductDto> {
    return EitherIO.from(MyCarInvalidStateDomainError.toFn(), () =>
      this._myCarProductRepository.updateById(myCarId, { status }),
    );
  }
}
