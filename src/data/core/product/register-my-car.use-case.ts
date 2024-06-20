import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { MyCarKeys, MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { PlanPayableWith, PlanTag } from 'src/domain/_entity/plan.entity';
import { QueryResponseEntity } from 'src/domain/_entity/query-response.entity';
import {
  MyCarAlreadyExistsDomainError,
  MyCarIsAlreadyRegisteredDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { SubscriptionStatus } from 'src/domain/_entity/subscription.entity';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { QueryKeysDto } from 'src/domain/_layer/data/dto/query-keys.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { PlanRepository } from 'src/domain/_layer/infrastructure/repository/plan.repository';
import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  QueryRequestService,
  RequestQueryServiceInput,
} from 'src/domain/_layer/infrastructure/service/query-request.service';
import { RegisterMyCarDomain, RegisterMyCarIO } from 'src/domain/core/product/register-my-car.domain';
import { RevisionVo } from 'src/domain/value-object/revision.vo';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { PlanAvailabilityHelper } from './plan-availability.helper';

type MakeRequestInput = {
  readonly keys: {
    readonly fipeId: string;
    readonly plate: string;
  };
  readonly name: string;
  readonly email: string;
};

@Injectable()
export class RegisterMyCarUseCase implements RegisterMyCarDomain, OnModuleInit {
  private _originalCnpj: string;
  private _plan: PlanDto;

  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _myCarProductRepository: MyCarProductRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _planAvailability: PlanAvailabilityHelper,
    private readonly _paymentGatewayService: PaymentGatewayService,
    private readonly _subscriptionRepository: SubscriptionRepository,
    private readonly _planRepository: PlanRepository,
    private readonly _envService: EnvService,
  ) {
    this._originalCnpj = this._envService.get(ENV_KEYS.CNPJ1);
  }

  async onModuleInit(): Promise<void> {
    /** TODO: Needs to be refreshed */
    const myCarsPlanId: string = this._envService.get(ENV_KEYS.MY_CARS_PREMIUM_PLAN_ID);
    this._plan = await this._planRepository.getById(myCarsPlanId);
  }

  registerPlate(userId: string, plate: string, fipeId: string, creditCardId?: string): RegisterMyCarIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId))
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .flatMap(async (user: UserDto) => {
        /** Authenticity will be verified on the gateway upon trying to create the subscription */
        const hasCard: boolean = Boolean(creditCardId);

        if (hasCard) {
          return this._registerMyCarWithSubscription(fipeId, plate, user, creditCardId);
        } else {
          const isAlreadyRegistered: boolean = await this._myCarProductRepository.hasActiveProduct(
            userId,
            plate,
            fipeId,
          );
          if (isAlreadyRegistered) return EitherIO.raise(MyCarIsAlreadyRegisteredDomainError.toFn());

          return this._planAvailability
            .getUserFreemiumAvailability(user)
            .flatMap((hasAvailability: boolean) =>
              hasAvailability
                ? this._registerMyCarFreely(fipeId, plate, user)
                : EitherIO.raise(MyCarAlreadyExistsDomainError.toFn()),
            );
        }
      });
  }

  private _registerMyCarWithSubscription(
    fipeId: string,
    plate: string,
    user: UserDto,
    creditCardId: string,
  ): RegisterMyCarIO {
    return this._getKeyCarByUser(fipeId, plate, user).flatMap((myCarKeys: MyCarKeys) =>
      EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
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
          this._originalCnpj,
        ),
      )
        .filter(
          ProviderUnavailableDomainError.toFn(),
          (extSubscription: ExternalSubscriptionDto) => extSubscription.status === ExternalSubscriptionStatus.ACTIVE,
        )
        .flatMap((extSubscription: ExternalSubscriptionDto) => this._createSubscription(user, extSubscription))
        .map((subscription: SubscriptionDto) =>
          this._myCarProductRepository.insert({
            billingId: user.billingId,
            subscriptionId: subscription.id,
            type: MyCarProductTypeEnum.PREMIUM,
            status: MyCarProductStatusEnum.ACTIVE,
            expiresAt: subscription.expiresAt,
            deactivatedAt: null,
            deletedAt: null,
            keys: myCarKeys,
          }),
        ),
    );
  }

  private _createSubscription(
    user: UserDto,
    extSubscription: ExternalSubscriptionDto,
  ): EitherIO<UnknownDomainError, SubscriptionDto> {
    // TODO: Recheck fields
    const sub: Omit<SubscriptionDto, 'createdAt' | 'updatedAt' | 'userId'> = {
      id: extSubscription.idempotence,
      billingId: user.billingId,
      gateway: extSubscription.gateway,
      gatewayRef: extSubscription.ref,
      ignoreBillingNotification: true, // ??
      paymentIds: [],
      paymentMethod: PlanPayableWith.CREDIT_CARD,
      planId: this._plan.id,
      planTag: PlanTag.MY_CARS,
      status: SubscriptionStatus.ACTIVE,
      deactivatedAt: null,
      expiresAt: extSubscription.expiresAt,
      nextChargeAt: extSubscription.chargeAt,
    };
    return EitherIO.from(UnknownDomainError.toFn(), () => this._subscriptionRepository.insert(sub));
  }

  private _registerMyCarFreely(fipeId: string, plate: string, user: UserDto): RegisterMyCarIO {
    return this._getKeyCarByUser(fipeId, plate, user).map((myCarKeys: MyCarKeys) =>
      this._myCarProductRepository.insert({
        billingId: user.billingId,
        subscriptionId: null,
        type: MyCarProductTypeEnum.FREEMIUM,
        status: MyCarProductStatusEnum.ACTIVE,
        expiresAt: null,
        deactivatedAt: null,
        deletedAt: null,
        keys: myCarKeys,
      }),
    );
  }

  private _getKeyCarByUser(fipeId: string, plate: string, user: UserDto): EitherIO<UnknownDomainError, MyCarKeys> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._makeRequest({
        keys: {
          fipeId,
          plate,
        },
        email: user.email,
        name: user.name,
      }),
    )
      .map((queryRef: string) => this._getResponse(queryRef))
      .filter(ProviderUnavailableDomainError.toFn(), (response: QueryResponseDto) => this._responseIsntFailed(response))
      .map((response: QueryResponseEntity) => this._parseResponse(response));
  }

  private async _makeRequest({ keys, name, email }: MakeRequestInput): Promise<string> {
    const randomicNumber: number = Math.random() + Date.now();
    const queryRef: string = btoa(randomicNumber.toString());
    const inputQuery: RequestQueryServiceInput = {
      queryRef: queryRef,
      templateQueryRef: '2',
      keys: {
        plate: keys.plate,
        fipeId: keys.fipeId,
        fipeIds: [keys.fipeId],
      },
      support: {
        userName: name,
        userEmail: email,
      },
    };

    await this._queryRequestService.requestQuery(inputQuery);
    return queryRef;
  }

  private async _getResponse(queryRef: string): Promise<QueryResponseDto> {
    const response: QueryResponseEntity = await this._queryRequestService.getAsyncQueryByReference(queryRef);
    return response;
  }

  private _parseResponse({ keys, response }: QueryResponseDto): MyCarKeys {
    return {
      brand: keys.brand,
      brandModelCode: keys.modelBrandCode.toString(),
      fipeName: response.basicVehicle.version,
      chassis: keys.chassis,
      plate: keys.plate,
      model: keys.model,
      fipeId: keys.fipeId,
      versionId: RegisterMyCarUseCase._getVersionId(keys, response?.revision),
      modelYear: keys.modelYear,
      engineNumber: keys.engine,
      engineCapacity: keys.engineCapacity,
      zipCode: keys.zipCode,
    };
  }

  private static _getVersionId(keys: QueryKeysDto, revision: ReadonlyArray<RevisionVo>): string | undefined {
    const record: RevisionVo | undefined = revision?.find(({ fipeId }: RevisionVo) => fipeId === Number(keys.fipeId));
    return record?.versionId?.toString();
  }

  private _responseIsntFailed(response: QueryResponseDto): boolean {
    return response.status !== 'FAILED';
  }
}
