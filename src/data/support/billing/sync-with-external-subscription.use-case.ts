import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { SyncWithExternalSubscriptionHelper } from 'src/data/shared/sync-with-external-subscription.helper';
import {
  NoSubscriptionFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { ExternalSubscriptionDto } from 'src/domain/_layer/data/dto/external-subscription.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  SyncWithExternalSubscriptionDomain,
  SyncWithExternalSubscriptionIO,
} from 'src/domain/support/billing/sync-with-external-subscription.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

@Injectable()
export class SyncWithExternalSubscriptionUseCase implements SyncWithExternalSubscriptionDomain {
  public originalCnpj: string;

  constructor(
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _syncWithExternalSubscriptionHelper: SyncWithExternalSubscriptionHelper,
    private readonly _envService: EnvService,
  ) {
    this.originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  syncWithExternalReference(externalReference: string, idempotence: string): SyncWithExternalSubscriptionIO {
    return this._fetchSubscription(idempotence).flatMap((subscription: SubscriptionDto) =>
      this._syncWithExternalSubscriptionHelper.applyActionExternalSubscriptionAndSync(
        subscription,
        this._fetchExternalSubscription(externalReference),
      ),
    );
  }

  private _fetchSubscription(
    subscriptionId: string,
  ): EitherIO<UnknownDomainError | NoSubscriptionFoundDomainError, SubscriptionDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._subscriptionRepository.getById(subscriptionId)).filter(
      NoSubscriptionFoundDomainError.toFn(),
      Boolean,
    );
  }

  private _fetchExternalSubscription(
    externalReference: string,
  ): EitherIO<ProviderUnavailableDomainError, ExternalSubscriptionDto> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.fetchSubscription(externalReference, this.originalCnpj),
    );
  }
}
