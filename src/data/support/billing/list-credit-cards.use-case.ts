import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { ExternalSubscriptionDto } from 'src/domain/_layer/data/dto/external-subscription.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  CreditCardWithSubscriptions,
  CreditCardsWithSubscriptions,
  PaymentGatewayService,
} from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { CreditCardsWithSubscriptionsOutputDto } from 'src/domain/_layer/presentation/dto/credit-card-with-subscriptions.dto';
import { SubscriptionOutputDto } from 'src/domain/_layer/presentation/dto/subscription-output.dto';
import { ListCreditCardsDomain, ListCreditCardsIO } from 'src/domain/support/billing/list-credit-cards.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { ArcUtil } from 'src/infrastructure/util/arc.util';

@Injectable()
export class ListCreditCardsUseCase implements ListCreditCardsDomain {
  private _originalCnpj: string;

  constructor(
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _userRepository: UserRepository,
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _arcUtil: ArcUtil,
    private readonly _envService: EnvService,
  ) {
    this._originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  listAll(userId: string): ListCreditCardsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .filter(UnknownDomainError.toFn(), (user: UserDto) =>
        this._arcUtil.verifyIfUserHasIdForTenant(user, this._originalCnpj),
      )
      .flatMap(this._externalList.bind(this));
  }

  _externalList(user: UserDto): ListCreditCardsIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.listCreditCardsOfUser(
        this._arcUtil.getUserArcRef(user, this._originalCnpj),
        this._originalCnpj,
      ),
    ).map(
      async (externalCreditCards: CreditCardsWithSubscriptions): Promise<CreditCardsWithSubscriptionsOutputDto> => ({
        creditCards: await Promise.all(
          externalCreditCards.map(async (externalCard: CreditCardWithSubscriptions) => {
            const subscriptions: ReadonlyArray<SubscriptionOutputDto> = await Promise.all(
              externalCard.externalSubscriptions.map(
                async (extSubscription: ExternalSubscriptionDto): Promise<SubscriptionOutputDto> => {
                  try {
                    const subscription: SubscriptionDto = await this._subscriptionRepository.getById(
                      extSubscription.idempotence,
                    );
                    return {
                      plan: null, // TODO
                      relatedData: null,
                      creditCardLast4: externalCard.creditCard.lastFourDigits,
                      creditCardId: externalCard.creditCard.id,
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
                    };
                  } catch (error) {
                    return null;
                  }
                },
              ),
            );

            return {
              creditCard: externalCard.creditCard,
              subscriptions: subscriptions.filter(Boolean),
            };
          }),
        ),
      }),
    );
  }
}
