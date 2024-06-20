import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionGateway } from 'src/domain/_entity/subscription.entity';
import { ExternalSubscriptionDto } from 'src/domain/_layer/data/dto/external-subscription.dto';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import {
  ExternalLegacyGatewaySubscription,
  LegacySubscriptionGatewayService,
} from 'src/domain/_layer/infrastructure/service/legacy-subscription-gateway.service';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  ExtraInfo,
  ListUserSubscriptionsDomain,
  ListUserSubscriptionsIO,
} from 'src/domain/support/billing/list-user-subscriptions.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

type SubWithPlan = SubscriptionDto & { plan: PlanDto };

@Injectable()
export class ListUserSubscriptionsUseCase implements ListUserSubscriptionsDomain {
  private _originalCnpj: string;

  constructor(
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _envService: EnvService,
    private readonly _legacySubscriptionGatewayService: LegacySubscriptionGatewayService,
  ) {
    this._originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  listByUser(userId: string, page: number, perPage: number): ListUserSubscriptionsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._subscriptionRepository.getPaginatedOwnedByUser(userId, page, perPage),
    ).map(async (subscriptionsPage: PaginationOf<SubWithPlan>) => {
      return {
        ...subscriptionsPage,
        items: await Promise.all(
          subscriptionsPage.items.map(async (subscription: SubWithPlan): Promise<SubscriptionDto & ExtraInfo> => {
            // ough
            if (subscription.gateway === SubscriptionGateway.ARC) {
              // TODO
              try {
                const externalSubscription: ExternalSubscriptionDto =
                  await this._paymentGatewayService.fetchSubscription(subscription.gatewayRef, this._originalCnpj);

                return {
                  ...subscription,
                  creditCardId: externalSubscription.creditCardRef,
                  creditCardLast4: externalSubscription.creditCard.lastFourDigits,
                };
              } catch (_err) {
                return {
                  ...subscription,
                  creditCardId: null,
                  creditCardLast4: null,
                };
              }
            } else {
              try {
                const extLegacySub: ExternalLegacyGatewaySubscription =
                  await this._legacySubscriptionGatewayService.searchSubscription(subscription.gatewayRef);

                return {
                  ...subscription,
                  nextChargeAt: new Date(extLegacySub.cycled_at).toISOString(),
                  creditCardId: null,
                  creditCardLast4: null,
                };
              } catch (_err) {
                return {
                  ...subscription,
                  creditCardId: null,
                  creditCardLast4: null,
                };
              }
            }
          }),
        ),
      };
    });
  }
}
