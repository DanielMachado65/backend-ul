import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoSubscriptionFoundDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  SubscriptionInvalidStateDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  CancelUserSubscriptionDomain,
  CancelUserSubscriptionIO,
} from 'src/domain/support/billing/cancel-user-subscription.domain';
import { SyncWithExternalSubscriptionHelper } from '../../shared/sync-with-external-subscription.helper';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class CancelUserSubscriptionUseCase implements CancelUserSubscriptionDomain {
  public originalCnpj: string;

  constructor(
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _userRepository: UserRepository,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _syncWithExternalSubscriptionHelper: SyncWithExternalSubscriptionHelper,
    private readonly _envService: EnvService,
  ) {
    this.originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  /**
   * TODO: maybe use the sync usecase here
   */
  cancelById(subscriptionId: string, userId: string): CancelUserSubscriptionIO {
    // TODO: IDOR > user <> subscription
    return this._fetchSubscription(subscriptionId, userId)
      .filter(
        SubscriptionInvalidStateDomainError.toFn(),
        (sub: SubscriptionDto) => sub.status === SubscriptionStatus.ACTIVE, // unnecessary
      )
      .flatMap((subscription: SubscriptionDto) =>
        this._syncWithExternalSubscriptionHelper.applyActionExternalSubscriptionAndSync(
          subscription,
          EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
            this._paymentGatewayService.cancelSubscription(subscription.gatewayRef, userId, this.originalCnpj),
          ),
        ),
      );
  }

  private _fetchSubscription(
    subscriptionId: string,
    userId: string,
  ): EitherIO<UnknownDomainError | NoSubscriptionFoundDomainError, SubscriptionDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._subscriptionRepository.getByIdOwnedByUser(subscriptionId, userId),
    ).filter(NoSubscriptionFoundDomainError.toFn(), Boolean);
  }

  private _fetchUser(userId: string): EitherIO<UnknownDomainError | NoUserFoundDomainError, UserDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId)).filter(
      NoUserFoundDomainError.toFn(),
      Boolean,
    );
  }
}
