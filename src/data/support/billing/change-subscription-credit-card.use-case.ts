import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  UnknownDomainError,
  NoSubscriptionFoundDomainError,
  ProviderUnavailableDomainError,
} from 'src/domain/_entity/result.error';
import { ExternalSubscriptionDto } from 'src/domain/_layer/data/dto/external-subscription.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  ChangeSubscriptionCreditCardDomain,
  ChangeSubscriptionCreditCardIO,
} from 'src/domain/support/billing/change-subscription-credit-card.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { GetSubscriptionRelatedDataHelper } from './get-subscription-related-data.helper';
import {
  SubscriptionOutputDto,
  SubscriptionRelatedDataDto,
} from 'src/domain/_layer/presentation/dto/subscription-output.dto';

@Injectable()
export class ChangeSubscriptionCreditCardUseCase implements ChangeSubscriptionCreditCardDomain {
  public originalCnpj: string;

  constructor(
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _envService: EnvService,
    private readonly _getSubscriptionRelatedDataHelper: GetSubscriptionRelatedDataHelper,
  ) {
    this.originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  changeBySubscriptionId(subscriptionId: string, creditCardId: string, userId: string): ChangeSubscriptionCreditCardIO {
    return this._fetchSubscription(subscriptionId, userId).flatMap((subscription: SubscriptionDto) =>
      EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
        this._paymentGatewayService.changeCreditCardSubscription(
          subscription.gatewayRef,
          userId,
          creditCardId,
          this.originalCnpj,
        ),
      )
        .map((extSub: ExternalSubscriptionDto) => ({
          relatedData: null,
          creditCardLast4: extSub.creditCard.lastFourDigits,
          creditCardId: extSub.creditCard.id,
          id: subscription.id,
          userId: subscription.userId,
          status: subscription.status,
          planTag: subscription.planTag,
          lastChargeInCents: 0,
          deactivatedAt: subscription.deactivatedAt,
          nextChargeAt: subscription.nextChargeAt,
          expiresAt: subscription.expiresAt,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        }))
        .flatMap((subscriptionOut: SubscriptionOutputDto) =>
          this._getSubscriptionRelatedDataHelper
            .fromSingle(subscription.userId, subscriptionOut.id)
            .map((relatedData: SubscriptionRelatedDataDto) => ({ ...subscriptionOut, relatedData })),
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
}
