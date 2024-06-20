import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { PlanPayableWith, PlanTag } from 'src/domain/_entity/plan.entity';
import {
  MyCarInvalidStateDomainError,
  NoSubscriptionFoundDomainError,
  NoUserFoundDomainError,
  NotFoundMyCarDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  UpgradeMyCarProductToPremiumDomain,
  UpgradeMyCarProductToPremiumIO,
} from 'src/domain/core/product/upgrade-my-car-product-to-premium.domain';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';

type UserWithMyCar = readonly [UserDto, MyCarProductDto];

@Injectable()
export class UpgradeMyCarProductToPremiumUseCase implements UpgradeMyCarProductToPremiumDomain {
  public originalCnpj: string;
  private _plan: PlanDto;

  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _planRepository: PlanRepository,
    private readonly _envService: EnvService,
  ) {}

  async onModuleInit(): Promise<void> {
    /** TODO: Needs to be refreshed */
    const myCarsPlanId: string = this._envService.get(ENV_KEYS.MY_CARS_PREMIUM_PLAN_ID);
    this.originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
    this._plan = await this._planRepository.getById(myCarsPlanId);
  }

  // TODO: What happens if subscription is created externally but fails updating on local?
  upgrade(myCarProductId: string, userId: string, creditCardId: string): UpgradeMyCarProductToPremiumIO {
    return this._fetchMyCarAndUser(myCarProductId, userId).flatMap(([user, myCar]: UserWithMyCar) =>
      this._createExternalSubscription(user, creditCardId).flatMap((externalSubscription: ExternalSubscriptionDto) =>
        this._createInternalSubscriptionAndUpdateMC(user, myCar, externalSubscription),
      ),
    );
  }

  private _fetchMyCarAndUser(
    myCarId: string,
    userId: string,
  ): EitherIO<UnknownDomainError | NoSubscriptionFoundDomainError, UserWithMyCar> {
    return EitherIO.from(
      UnknownDomainError.toFn(),
      async (): Promise<UserWithMyCar> => [
        await this._userRepository.getById(userId),
        await this._myCarProductRepository.getByIdOwnedByUser(myCarId, userId),
      ],
    )
      .filter(NoUserFoundDomainError.toFn(), ([user]: UserWithMyCar) => Boolean(user))
      .filter(NotFoundMyCarDomainError.toFn(), ([, myCar]: UserWithMyCar) => Boolean(myCar))
      .filter(
        MyCarInvalidStateDomainError.toFn(),
        ([, myCar]: UserWithMyCar) => myCar.status === MyCarProductStatusEnum.ACTIVE,
      );
  }

  private _createExternalSubscription(
    user: UserDto,
    creditCardId: string,
  ): EitherIO<ProviderUnavailableDomainError, ExternalSubscriptionDto> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._paymentGatewayService.createSubscription(
        {
          user,
          idempotence: this._subscriptionRepository.generateNewId(),
          recurringCycle: 'monthly',
          recurringValueInCents: this._plan.costInCents,
          ensureWorkingDay: true,
          minDaysBeforeDue: 0,
          minDaysBeforeExpire: 5,
          strategyRef: null,
          creditCardRef: creditCardId,
        },
        this.originalCnpj,
      ),
    ).filter(
      ProviderUnavailableDomainError.toFn(),
      (extSubscription: ExternalSubscriptionDto) => extSubscription.status === ExternalSubscriptionStatus.ACTIVE,
    );
  }

  private _createInternalSubscriptionAndUpdateMC(
    user: UserDto,
    myCar: MyCarProductDto,
    externalSubscription: ExternalSubscriptionDto,
  ): EitherIO<UnknownDomainError, SubscriptionDto> {
    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      // TODO: Recheck fields
      const sub: Omit<SubscriptionDto, 'createdAt' | 'updatedAt' | 'userId'> = {
        id: externalSubscription.idempotence,
        billingId: user.billingId,
        gateway: externalSubscription.gateway,
        gatewayRef: externalSubscription.ref,
        ignoreBillingNotification: true, // ??
        paymentIds: [],
        paymentMethod: PlanPayableWith.CREDIT_CARD,
        planId: this._plan.id,
        planTag: PlanTag.MY_CARS,
        status: SubscriptionStatus.ACTIVE,
        deactivatedAt: null,
        expiresAt: externalSubscription.expiresAt,
        nextChargeAt: externalSubscription.chargeAt,
      };

      const subscription: SubscriptionDto = await this._subscriptionRepository.insert(sub);

      await this._myCarProductRepository.updateById(myCar.id, {
        subscriptionId: subscription.id,
        type: MyCarProductTypeEnum.PREMIUM,
        status: MyCarProductStatusEnum.ACTIVE,
        expiresAt: subscription.expiresAt,
      });

      return subscription;
    });
  }
}
