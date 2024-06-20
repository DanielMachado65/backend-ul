import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Observable, firstValueFrom } from 'rxjs';
import {
  PaymentBankingBillet,
  PaymentEntity,
  PaymentGatewayType,
  PaymentPix,
  PaymentStatus,
  PaymentType,
} from 'src/domain/_entity/payment.entity';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionGateway } from 'src/domain/_entity/subscription.entity';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { MetaArcWebhookDto } from 'src/domain/_layer/data/dto/arc-webhook.dto';
import { CreditCardMinimalDto } from 'src/domain/_layer/data/dto/credit-card-minimal.dto';
import { CreditCardDto } from 'src/domain/_layer/data/dto/credit-card.dto';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionRecurringCycle,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import {
  ExternalPaymentStateDto,
  PaymentError,
  PaymentResponseDto,
} from 'src/domain/_layer/data/dto/payment-response.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import {
  CreateSubscription,
  CreditCardsWithSubscriptions,
  ICreateCustomerOptions,
  ITelemetryHeadersParam,
  IUserDataValidatedResponse,
  NecessaryDataForCustomer,
  PaymentGatewayService,
  ThingsLockingCreditCard,
} from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { AddUserParams } from 'src/domain/core/user/add-user.domain';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { LoggingAxiosInterceptor } from '../interceptor/logging-axios.interceptor';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { Currency, CurrencyUtil } from '../util/currency.util';

/** Request post body parts */

interface IExtraPart {
  readonly strategy_id: string | null;
}

type ExternalPaymentMethod = 'pix' | 'bank_slip' | 'credit_card';

interface IPaymentInfoPart {
  readonly total_value_in_cents: number;
  readonly amount_to_discount_in_cents: number;
  readonly number_of_installments: number;
  readonly method: ExternalPaymentMethod;
  readonly idempotence: string;
}

interface ICustomerInfoPart {
  readonly tenant_ref: string;
}

type RequestPaymentDto = IPaymentInfoPart & ICustomerInfoPart & IExtraPart;

type WithCardToken<Dto> = Dto & { readonly credit_card_token: string };

interface ICreateCustomer {
  readonly tenant_ref: string;
  readonly document: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly phone: string;
  readonly email: string;
  readonly street: string;
  readonly number: string;
  readonly neighborhood: string;
  readonly city: string;
  readonly state: string;
  readonly zipcode: string;
  readonly complement: string;
  readonly ensure?: boolean;
}

/** DTOs */

class CardTokenResponseDto {
  @IsString()
  token: string;
}

class ExternalCardTokenResponseDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CardTokenResponseDto)
  data: CardTokenResponseDto;
}

class CustomerResponseDto {
  @IsString()
  id: string;

  @IsString()
  tenant_ref: string;

  @IsString()
  document_type: string;

  @IsString()
  document: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  street: string;

  @IsString()
  number: string;

  @IsString()
  neighborhood: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipcode: string;

  @IsString()
  complement: string;

  @IsString()
  tenant_id: string;
}

class CustomerResponseDataDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerResponseDto)
  data: CustomerResponseDto;
}

enum ExternalPaymentStatuses {
  PENDING = 'pending',
  PAID = 'paid',
  UNPAID = 'unpaid',
  CANCELLING = 'cancelling',
  CANCELLED = 'cancelled',
  REFUNDING = 'refunding',
  REFUNDED = 'refunded',
}

class ArcBankSlipResource {
  @IsString()
  @IsOptional()
  barcode: string;

  @IsString()
  @IsOptional()
  barcode_link: string;
}

class ArcCreditCardResource {
  @IsString()
  @IsNotEmpty()
  token: string;
}

class ArcPixResource {
  @IsString()
  @IsOptional()
  qr_code: string;

  @IsString()
  @IsOptional()
  qr_code_image: string;
}

class ArcCurrentGateway {
  @IsString()
  id: string;

  @IsString()
  gateway: string;

  @IsString()
  @IsOptional()
  gateway_ref: string | null;

  @IsNumber()
  priority: number;

  @IsString()
  status: string;

  @IsNumber()
  timeout_ms: number;

  @IsString()
  @IsOptional()
  inserted_at: string;

  @IsString()
  @IsOptional()
  updated_at: string;
}

class ExternalPaymentArcResponseDataDto {
  @IsString()
  id: string;

  // risk_level: unknown;
  // total_value_in_cents: unknown;
  // discount_value_in_cents: unknown;
  // installment_value_in_cents: unknown;
  // refunded_value_in_cents: unknown;
  // number_of_installments: unknown;

  @IsISO8601()
  @IsOptional()
  paid_at: string | null;

  // refund_at: unknown;

  @Type(() => ArcBankSlipResource)
  @ValidateNested()
  @IsOptional()
  bank_slip_resource: ArcBankSlipResource | null;

  @Type(() => ArcCreditCardResource)
  @ValidateNested()
  @IsOptional()
  credit_card_resource: ArcCreditCardResource | null;

  @Type(() => ArcPixResource)
  @ValidateNested()
  @IsOptional()
  pix_resource: ArcPixResource | null;

  // logs: unknown;
  // gateway_method: unknown;

  @IsString()
  @IsEnum(ExternalPaymentStatuses)
  status: ExternalPaymentStatuses;

  @Type(() => ArcCurrentGateway)
  @ValidateNested()
  @IsOptional()
  current_gateway: ArcCurrentGateway | null;

  // method: unknown;
  // strategy: unknown;
  // date: unknown;
  // tenant_origin_name: unknown;
}

abstract class ArcResponseDto<Data> {
  @IsObject()
  @ValidateNested()
  @Type(() => MetaArcWebhookDto)
  __meta__: MetaArcWebhookDto;

  abstract data: Data;
}

class ExternalPaymentArcResponseDto extends ArcResponseDto<ExternalPaymentArcResponseDataDto> {
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalPaymentArcResponseDataDto)
  data: ExternalPaymentArcResponseDataDto;
}

class RequestPaymentResponseDataDto {
  @IsString()
  id: string;
}

class RequestPaymentResponseDto {
  @IsObject()
  @Type(() => RequestPaymentResponseDataDto)
  @ValidateNested()
  data: RequestPaymentResponseDataDto;
}

class UserDataValidatedResponseDto {
  @IsBoolean()
  is_valid: boolean;

  @IsString()
  error_msg: string;
}

class ExternalValidationUserDataArcResponseDto extends ArcResponseDto<UserDataValidatedResponseDto> {
  @IsObject()
  @ValidateNested()
  @Type(() => UserDataValidatedResponseDto)
  data: UserDataValidatedResponseDto;
}

class ExternalCardDataDto {
  @IsString()
  brand: string;

  @IsString()
  customer_id: string;

  @IsString()
  expiration_date: string;

  @IsString()
  first_6_digits: string;

  @IsString()
  id: string;

  @IsString()
  inserted_at: string;

  @IsString()
  last_4_digits: string;
}

class ExternalCardResponseDto extends ArcResponseDto<ExternalCardDataDto> {
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalCardDataDto)
  data: ExternalCardDataDto;
}

class ExternalCardWithSubscriptionsDataDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalSubscriptionWithoutCardDataDto)
  subscriptions: ReadonlyArray<ExternalSubscriptionWithoutCardDataDto>;

  @IsString()
  brand: string;

  @IsString()
  customer_id: string;

  @IsString()
  expiration_date: string;

  @IsString()
  first_6_digits: string;

  @IsString()
  id: string;

  @IsISO8601()
  inserted_at: string;

  @IsString()
  last_4_digits: string;
}

class ExternalCardWithSubscriptionsResponseDto extends ArcResponseDto<
  ReadonlyArray<ExternalCardWithSubscriptionsDataDto>
> {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExternalCardWithSubscriptionsDataDto)
  data: ReadonlyArray<ExternalCardWithSubscriptionsDataDto>;
}

class ExternalSubscriptionDataDto {
  @IsString()
  id: string;

  @IsString()
  idempotence: string;

  @IsEnum(ExternalSubscriptionStatus)
  status: ExternalSubscriptionStatus;

  @IsEnum(ExternalSubscriptionRecurringCycle)
  recurring_cycle: ExternalSubscriptionRecurringCycle;

  @IsNumber()
  recurring_value_in_cents: number;

  @IsBoolean()
  ensure_working_day: boolean;

  @IsNumber()
  min_days_before_due: number;

  @IsNumber()
  min_days_before_expire: number;

  @IsISO8601()
  charge_at: string;

  @IsISO8601()
  due_at: string;

  @IsISO8601()
  expires_at: string;

  @IsISO8601()
  @IsOptional()
  last_paid_at: string;

  @IsString()
  tenant_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  strategy_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => ExternalCardDataDto)
  stored_card: ExternalCardDataDto;

  @IsString()
  stored_card_id: string;

  @IsISO8601()
  inserted_at: string;

  @IsISO8601()
  updated_at: string;
}

class ExternalSubscriptionWithoutCardDataDto {
  @IsString()
  id: string;

  @IsString()
  idempotence: string;

  @IsEnum(ExternalSubscriptionStatus)
  status: ExternalSubscriptionStatus;

  @IsEnum(ExternalSubscriptionRecurringCycle)
  recurring_cycle: ExternalSubscriptionRecurringCycle;

  @IsNumber()
  recurring_value_in_cents: number;

  @IsBoolean()
  ensure_working_day: boolean;

  @IsNumber()
  min_days_before_due: number;

  @IsNumber()
  min_days_before_expire: number;

  @IsString()
  @IsISO8601()
  charge_at: string;

  @IsString()
  @IsISO8601()
  due_at: string;

  @IsString()
  @IsISO8601()
  expires_at: string;

  @IsString()
  @IsISO8601()
  @IsOptional()
  last_paid_at: string;

  @IsString()
  tenant_id: string;

  @IsString()
  customer_id: string;

  @IsString()
  strategy_id: string;

  @IsString()
  stored_card_id: string;

  @IsString()
  @IsISO8601()
  inserted_at: string;

  @IsString()
  @IsISO8601()
  updated_at: string;
}

class CreateExternalSubscriptionResponseDto extends ArcResponseDto<ExternalSubscriptionDataDto> {
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalSubscriptionDataDto)
  data: ExternalSubscriptionDataDto;
}

class ChangeCreditCardSubscriptionResponseDto extends ArcResponseDto<ExternalSubscriptionDataDto> {
  @IsObject()
  @ValidateNested()
  @Type(() => ExternalSubscriptionDataDto)
  data: ExternalSubscriptionDataDto;
}

/** Types */

type BasicCredentials = {
  readonly username: string;
  readonly password: string;
};

type FullName = readonly [string, string];

@Injectable()
export class ArcApiService implements PaymentGatewayService {
  private static readonly TARGET_HEADER: string = 'arc';

  gateway: PaymentGatewayType = PaymentGatewayType.ARC;
  private readonly _applicationId: string;
  private readonly _arcToken: string;
  private readonly _baseUrl: string;
  private readonly _subscriptionStrategyRef: string;

  constructor(
    private readonly _httpService: HttpService,
    private readonly _envService: EnvService,
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _classValidatorUtil: ClassValidatorUtil,
  ) {
    this._applicationId = this._envService.get(ENV_KEYS.APPLICATION_ID);
    this._arcToken = this._envService.get(ENV_KEYS.ARC_TOKEN);
    this._baseUrl = this._envService.get(ENV_KEYS.ARC_URL);
    this._subscriptionStrategyRef = this._envService.get(ENV_KEYS.SUBSCRIPTION_STRATEGY_REF);
  }

  async createCardToken(
    dto: CreditCardDto,
    userId: string,
    reqParentId: string,
  ): Promise<Either<ProviderUnavailableDomainError, TokenEntity>> {
    const url: string = this._baseUrl + '/api/payment/card_token';
    const response$: Observable<AxiosResponse<ExternalCardTokenResponseDto>> = this._httpService.post(
      url,
      {
        holder_name: dto.holderName,
        card_number: dto.number,
        expiration_date: dto.expirationDate,
        security_code: dto.securityCode,
      },
      {
        headers: LoggingAxiosInterceptor.makeLogHeaders(
          reqParentId,
          ArcApiService.TARGET_HEADER,
          ArcApiService._createTelemetryHeaders({ userId }),
        ),
      },
    );
    const response: AxiosResponse<ExternalCardTokenResponseDto> = await firstValueFrom(response$);

    return this._classValidatorUtil
      .validateSyncAndResult(response.data, ExternalCardTokenResponseDto)
      .map((data: ExternalCardTokenResponseDto) => data.data);
  }

  async getCreditCardOfUser(userRef: string, creditCardRef: string, cnpj: string): Promise<CreditCardMinimalDto> {
    const url: string =
      this._baseUrl + `/api/customer/${encodeURIComponent(userRef)}/card/${encodeURIComponent(creditCardRef)}`;
    const response$: Observable<AxiosResponse<ExternalCardResponseDto>> = this._httpService.get(url, {
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<ExternalCardResponseDto> = await firstValueFrom(response$);
    const { data }: ExternalCardResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, ExternalCardResponseDto)
      .getRight();

    return {
      id: data.id,
      brandCard: data.brand,
      brandCardImg: this._fetchImgForBrandcard(data.brand),
      expirationDate: data.expiration_date,
      lastFourDigits: data.last_4_digits,
    };
  }

  async listCreditCardsOfUser(userRef: string, cnpj: string): Promise<CreditCardsWithSubscriptions> {
    const url: string = this._baseUrl + `/api/customer/${encodeURIComponent(userRef)}/card`;
    const response$: Observable<AxiosResponse<ExternalCardWithSubscriptionsResponseDto>> = this._httpService.get(url, {
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<ExternalCardWithSubscriptionsResponseDto> = await firstValueFrom(response$);
    const { data }: ExternalCardWithSubscriptionsResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, ExternalCardWithSubscriptionsResponseDto)
      .getRight();

    return data.map((cws: ExternalCardWithSubscriptionsDataDto) => ({
      creditCard: {
        id: cws.id,
        brandCard: cws.brand,
        brandCardImg: this._fetchImgForBrandcard(cws.brand),
        expirationDate: cws.expiration_date,
        lastFourDigits: cws.last_4_digits,
      },
      externalSubscriptions: cws.subscriptions.map(
        (extSubscription: ExternalSubscriptionDataDto): ExternalSubscriptionDto => ({
          ref: extSubscription.id,
          idempotence: extSubscription.idempotence,
          status: extSubscription.status,
          recurringCycle: extSubscription.recurring_cycle,
          recurringValueInCents: extSubscription.recurring_value_in_cents,
          daysBeforeExpire: extSubscription.min_days_before_expire, // TODO
          chargeAt: extSubscription.charge_at + 'Z',
          dueAt: extSubscription.due_at + 'Z',
          expiresAt: extSubscription.expires_at + 'Z',
          creditCardRef: extSubscription.stored_card_id,
          creditCard: {
            id: cws.id,
            brandCard: cws.brand,
            brandCardImg: this._fetchImgForBrandcard(cws.brand),
            expirationDate: cws.expiration_date,
            lastFourDigits: cws.last_4_digits,
          },
          customerRef: extSubscription.customer_id,
          strategyRef: extSubscription.strategy_id,
          gateway: SubscriptionGateway.ARC,
          createdAt: extSubscription.inserted_at + 'Z',
        }),
      ),
    }));
  }

  async saveCreditCard(userRef: string, creditCard: CreditCardDto, cnpj: string): Promise<CreditCardMinimalDto> {
    const url: string = this._baseUrl + `/api/customer/${encodeURIComponent(userRef)}/card`;
    const response$: Observable<AxiosResponse<ExternalCardResponseDto>> = this._httpService.post(
      url,
      {
        holder_name: creditCard.holderName,
        card_number: creditCard.number,
        expiration_date: creditCard.expirationDate,
        security_code: creditCard.securityCode,
      },
      {
        auth: this._getCredentials(cnpj),
      },
    );
    const response: AxiosResponse<ExternalCardResponseDto> = await firstValueFrom(response$);
    const { data }: ExternalCardResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, ExternalCardResponseDto)
      .getRight();

    return {
      id: data.id,
      brandCard: data.brand,
      brandCardImg: this._fetchImgForBrandcard(data.brand),
      expirationDate: data.expiration_date,
      lastFourDigits: data.last_4_digits,
    };
  }

  async removeCreditCard(
    userRef: string,
    creditCardRef: string,
    cnpj: string,
  ): Promise<Either<ThingsLockingCreditCard, CreditCardMinimalDto>> {
    const url: string =
      this._baseUrl + `/api/customer/${encodeURIComponent(userRef)}/card/${encodeURIComponent(creditCardRef)}`;
    const response$: Observable<AxiosResponse<ExternalCardResponseDto>> = this._httpService.delete(url, {
      auth: this._getCredentials(cnpj),
      validateStatus: (status: number) => status === 200 || status === 403,
    });
    const response: AxiosResponse<ExternalCardResponseDto> = await firstValueFrom(response$);
    if (response.status === 200) {
      const { data }: ExternalCardResponseDto = this._classValidatorUtil
        .validateSyncAndResult(response.data, ExternalCardResponseDto)
        .getRight();

      return Either.right({
        id: data.id,
        brandCard: data.brand,
        brandCardImg: this._fetchImgForBrandcard(data.brand),
        expirationDate: data.expiration_date,
        lastFourDigits: data.last_4_digits,
      });
    } else {
      type Error = {
        readonly error: {
          readonly description: string;
          readonly details: {
            readonly all_errors: readonly [
              {
                readonly description: string;
                readonly details: {
                  readonly subscription_id: string;
                  readonly type: string;
                };
                readonly hint: string;
                readonly level: string;
                readonly tag: string;
              },
            ];
          };
        };
      };
      const error: Error = response.data as unknown as Error;
      return Either.left(
        new ThingsLockingCreditCard(
          // eslint-disable-next-line @typescript-eslint/typedef
          error.error.details.all_errors.map((instance) => ({
            generalDescription: instance.description,
            details: { subscriptionRef: instance.details.subscription_id, type: instance.details.type },
          })),
        ),
      );
    }
  }

  async fetchSubscription(externalSubscriptionId: string, cnpj: string): Promise<ExternalSubscriptionDto> {
    const url: string = this._baseUrl + `/api/subscription/${encodeURIComponent(externalSubscriptionId)}`;
    const response$: Observable<AxiosResponse<CreateExternalSubscriptionResponseDto>> = this._httpService.get(url, {
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<CreateExternalSubscriptionResponseDto> = await firstValueFrom(response$);

    const { data }: CreateExternalSubscriptionResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, CreateExternalSubscriptionResponseDto)
      .getRight();

    return {
      ref: data.id,
      idempotence: data.idempotence,
      status: data.status,
      recurringCycle: data.recurring_cycle,
      recurringValueInCents: data.recurring_value_in_cents,
      daysBeforeExpire: data.min_days_before_expire, // TODO
      chargeAt: data.charge_at + 'Z',
      dueAt: data.due_at + 'Z',
      expiresAt: data.expires_at + 'Z',
      creditCard: {
        id: data.stored_card.id,
        brandCard: data.stored_card.brand,
        brandCardImg: this._fetchImgForBrandcard(data.stored_card.brand),
        expirationDate: data.stored_card.expiration_date,
        lastFourDigits: data.stored_card.last_4_digits,
      },
      creditCardRef: data.stored_card_id,
      customerRef: data.customer_id,
      strategyRef: data.strategy_id,
      gateway: SubscriptionGateway.ARC,
      createdAt: data.inserted_at + 'Z',
    };
  }

  async createSubscription(subscriptionParams: CreateSubscription, cnpj: string): Promise<ExternalSubscriptionDto> {
    const url: string = this._baseUrl + `/api/subscription`;
    const response$: Observable<AxiosResponse<CreateExternalSubscriptionResponseDto>> = this._httpService.post(
      url,
      {
        tenant_ref: subscriptionParams.user.id,
        idempotence: subscriptionParams.idempotence,
        recurring_cycle: subscriptionParams.recurringCycle,
        recurring_value_in_cents: subscriptionParams.recurringValueInCents,
        ensure_working_day: subscriptionParams.ensureWorkingDay,
        min_days_before_due: subscriptionParams.minDaysBeforeDue,
        min_days_before_expire: subscriptionParams.minDaysBeforeExpire,
        strategy_id: subscriptionParams.strategyRef || this._subscriptionStrategyRef,
        stored_card_id: subscriptionParams.creditCardRef,
      },
      {
        auth: this._getCredentials(cnpj),
      },
    );
    const response: AxiosResponse<CreateExternalSubscriptionResponseDto> = await firstValueFrom(response$);

    const { data }: CreateExternalSubscriptionResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, CreateExternalSubscriptionResponseDto)
      .getRight();

    return {
      ref: data.id,
      idempotence: data.idempotence,
      status: data.status,
      recurringCycle: data.recurring_cycle,
      recurringValueInCents: data.recurring_value_in_cents,
      daysBeforeExpire: data.min_days_before_expire, // TODO
      chargeAt: data.charge_at + 'Z',
      dueAt: data.due_at + 'Z',
      expiresAt: data.expires_at + 'Z',
      creditCardRef: data.stored_card_id,
      creditCard: {
        id: data.stored_card.id,
        brandCard: data.stored_card.brand,
        brandCardImg: this._fetchImgForBrandcard(data.stored_card.brand),
        expirationDate: data.stored_card.expiration_date,
        lastFourDigits: data.stored_card.last_4_digits,
      },
      customerRef: data.customer_id,
      strategyRef: data.strategy_id,
      gateway: SubscriptionGateway.ARC,
      createdAt: data.inserted_at + 'Z',
    };
  }

  async cancelSubscription(subscriptionRef: string, _userId: string, cnpj: string): Promise<ExternalSubscriptionDto> {
    const url: string = this._baseUrl + `/api/subscription/${encodeURIComponent(subscriptionRef)}`;
    const response$: Observable<AxiosResponse<CreateExternalSubscriptionResponseDto>> = this._httpService.delete(url, {
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<CreateExternalSubscriptionResponseDto> = await firstValueFrom(response$);

    const { data }: CreateExternalSubscriptionResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, CreateExternalSubscriptionResponseDto)
      .getRight();

    return {
      ref: data.id,
      idempotence: data.idempotence,
      status: data.status,
      recurringCycle: data.recurring_cycle,
      recurringValueInCents: data.recurring_value_in_cents,
      daysBeforeExpire: data.min_days_before_expire, // TODO
      chargeAt: data.charge_at + 'Z',
      dueAt: data.due_at + 'Z',
      expiresAt: data.expires_at + 'Z',
      creditCardRef: data.stored_card_id,
      creditCard: {
        id: data.stored_card.id,
        brandCard: data.stored_card.brand,
        brandCardImg: this._fetchImgForBrandcard(data.stored_card.brand),
        expirationDate: data.stored_card.expiration_date,
        lastFourDigits: data.stored_card.last_4_digits,
      },
      customerRef: data.customer_id,
      strategyRef: data.strategy_id,
      gateway: SubscriptionGateway.ARC,
      createdAt: data.inserted_at + 'Z',
    };
  }

  async changeCreditCardSubscription(
    subscriptionRef: string,
    userId: string,
    creditCardRef: string,
    cnpj: string,
  ): Promise<ExternalSubscriptionDto> {
    const url: string = this._baseUrl + `/api/subscription/${encodeURIComponent(subscriptionRef)}/credit_card`;
    const response$: Observable<AxiosResponse<ChangeCreditCardSubscriptionResponseDto>> = this._httpService.put(
      url,
      {
        tenant_ref: userId,
        stored_card_id: creditCardRef,
      },
      {
        auth: this._getCredentials(cnpj),
      },
    );
    const response: AxiosResponse<ChangeCreditCardSubscriptionResponseDto> = await firstValueFrom(response$);

    const { data }: ChangeCreditCardSubscriptionResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, ChangeCreditCardSubscriptionResponseDto)
      .getRight();

    return {
      ref: data.id,
      idempotence: data.idempotence,
      status: data.status,
      recurringCycle: data.recurring_cycle,
      recurringValueInCents: data.recurring_value_in_cents,
      daysBeforeExpire: data.min_days_before_expire, // TODO
      chargeAt: data.charge_at + 'Z',
      dueAt: data.due_at + 'Z',
      expiresAt: data.expires_at + 'Z',
      creditCardRef: data.stored_card_id,
      creditCard: {
        id: data.stored_card.id,
        brandCard: data.stored_card.brand,
        brandCardImg: this._fetchImgForBrandcard(data.stored_card.brand),
        expirationDate: data.stored_card.expiration_date,
        lastFourDigits: data.stored_card.last_4_digits,
      },
      customerRef: data.customer_id,
      strategyRef: data.strategy_id,
      gateway: SubscriptionGateway.ARC,
      createdAt: data.inserted_at + 'Z',
    };
  }

  async fetchPayment(
    externalPaymentId: string,
    cnpj: string,
    reqParentId: string,
    telemetryParams: ITelemetryHeadersParam = {},
  ): Promise<ExternalPaymentStateDto> {
    const url: string = this._baseUrl + `/api/payment/${externalPaymentId}`;
    const response$: Observable<AxiosResponse<ExternalPaymentArcResponseDto>> = this._httpService.get(url, {
      headers: LoggingAxiosInterceptor.makeLogHeaders(
        reqParentId,
        ArcApiService.TARGET_HEADER,
        ArcApiService._createTelemetryHeaders(telemetryParams),
      ),
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<ExternalPaymentArcResponseDto> = await firstValueFrom(response$);
    const { data }: ExternalPaymentArcResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, ExternalPaymentArcResponseDto)
      .getRight();

    return {
      status: ArcApiService._mapExternalStatusToInternalStatus(data.status),
      bankSlipResource: ArcApiService._mapExternalBankSlipResourceToInternal(data.bank_slip_resource),
      creditCardResource: null,
      pixResource: ArcApiService._mapExternalPixResourceToInternal(data.pix_resource),
      details: {
        currentGateway: data.current_gateway && {
          gateway: data.current_gateway?.gateway?.toUpperCase() ?? null,
          referenceIn: data.current_gateway?.gateway_ref ?? null,
        },
      },
      paidAt: data.paid_at,
    };
  }

  async createCustomerIfNotExists(
    user: NecessaryDataForCustomer,
    cnpj: string,
    reqParentId: string,
    opts?: ICreateCustomerOptions,
  ): Promise<string> {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => this._getCustomer(user.id, cnpj, reqParentId))
      .catch(async (error: ProviderUnavailableDomainError) => {
        const customerId: string = await this.createCustomer(user, cnpj, reqParentId, opts);
        if (customerId) return Either.right(customerId);
        return Either.left(error);
      })
      .unsafeRun();
  }

  async createCustomer(
    user: NecessaryDataForCustomer,
    cnpj: string,
    reqParentId: string,
    opts?: ICreateCustomerOptions,
  ): Promise<string> {
    const url: string = this._baseUrl + '/api/customer';
    const [firstName, lastName]: FullName = ArcApiService._parseName(user.name);
    const body: ICreateCustomer = {
      ...this._createCustomerBody(firstName, lastName, user),
      tenant_ref: user.id,
      ensure: opts.ensurePossibleToCreatePayment ?? false,
    };
    const response$: Observable<AxiosResponse<CustomerResponseDataDto>> = this._httpService.post(url, body, {
      headers: LoggingAxiosInterceptor.makeLogHeaders(
        reqParentId,
        ArcApiService.TARGET_HEADER,
        ArcApiService._createTelemetryHeaders({ userId: user.id }),
      ),
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<CustomerResponseDataDto> = await firstValueFrom(response$);
    const data: CustomerResponseDataDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, CustomerResponseDataDto)
      .getRight();

    return String(data.data.id);
  }

  @Span('payment-v3')
  async paymentWithBankSlip(userId: string, payment: PaymentEntity, reqParentId: string): Promise<PaymentResponseDto> {
    const body: RequestPaymentDto = this._createPaymentBody(payment, userId);
    return await this._requestPayment(
      payment.cnpj,
      body as unknown as Record<string, unknown>,
      reqParentId,
      ArcApiService._createTelemetryHeaders({ paymentId: payment.id, userId }),
    );
  }

  @Span('payment-v3')
  async paymentWithCreditCard(
    userId: string,
    payment: PaymentEntity,
    cardToken: TokenEntity,
    reqParentId: string,
  ): Promise<PaymentResponseDto> {
    const body: WithCardToken<RequestPaymentDto> = {
      ...this._createPaymentBody(payment, userId),
      credit_card_token: cardToken.token,
    };
    return await this._requestPayment(
      payment.cnpj,
      body as unknown as Record<string, unknown>,
      reqParentId,
      ArcApiService._createTelemetryHeaders({ paymentId: payment.id, userId }),
    );
  }

  @Span('payment-v3')
  async paymentWithPix(userId: string, payment: PaymentEntity, reqParentId: string): Promise<PaymentResponseDto> {
    const body: RequestPaymentDto = this._createPaymentBody(payment, userId);
    return await this._requestPayment(
      payment.cnpj,
      body as unknown as Record<string, unknown>,
      reqParentId,
      ArcApiService._createTelemetryHeaders({ paymentId: payment.id, userId }),
    );
  }

  async validateUser(params: AddUserParams, cnpj: string, reqParentId: string): Promise<IUserDataValidatedResponse> {
    const url: string = this._baseUrl + '/api/validation/user';
    const [firstName, lastName]: FullName = ArcApiService._parseName(params.name);
    const body: Omit<ICreateCustomer, 'tenant_ref'> = this._createCustomerBody(firstName, lastName, params);
    const response$: Observable<AxiosResponse<CustomerResponseDataDto>> = this._httpService.post(url, body, {
      auth: this._getCredentials(cnpj),
      headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, ArcApiService.TARGET_HEADER),
    });
    const response: AxiosResponse<CustomerResponseDataDto> = await firstValueFrom(response$);
    const data: ExternalValidationUserDataArcResponseDto = this._classValidatorUtil
      .validateSyncAndResult(response.data, ExternalValidationUserDataArcResponseDto)
      .getRight();

    return {
      isValid: data.data.is_valid,
      errorMsg: data.data.error_msg,
    };
  }

  /** Private */

  private _getCredentials(cnpj: string): BasicCredentials {
    return {
      username: `${this._applicationId}@${cnpj}`,
      password: this._arcToken,
    };
  }

  private static _createTelemetryHeaders(params: ITelemetryHeadersParam): AxiosRequestHeaders {
    const headers: AxiosRequestHeaders = {} as AxiosRequestHeaders;

    // eslint-disable-next-line functional/immutable-data
    if (params.userId) headers['x-customer-ref'] = params.userId;
    // eslint-disable-next-line functional/immutable-data
    if (params.paymentId) headers['x-payment-ref'] = params.paymentId;

    return headers;
  }

  private async _getCustomer(userId: string, cnpj: string, reqParentId: string): Promise<string> {
    type Response = AxiosResponse<ArcResponseDto<{ readonly id: string }>>;

    const url: string = `${this._baseUrl}/api/customer/by_tenant_ref/${userId}`;
    const response$: Observable<Response> = this._httpService.get(url, {
      auth: this._getCredentials(cnpj),
      headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, ArcApiService.TARGET_HEADER),
    });
    const response: Response = await firstValueFrom(response$);

    const customerId: unknown = response.data.data.id;
    if (typeof customerId === 'string') return customerId;
    else throw null;
  }

  private async _requestPayment(
    cnpj: string,
    body: Record<string, unknown>,
    reqParentId: string,
    telemetryHeaders: AxiosRequestHeaders,
  ): Promise<PaymentResponseDto> {
    const url: string = this._baseUrl + '/api/payment';
    const response$: Observable<AxiosResponse<RequestPaymentResponseDto>> = this._httpService.post(url, body, {
      headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, ArcApiService.TARGET_HEADER, telemetryHeaders),
      auth: this._getCredentials(cnpj),
    });
    const response: AxiosResponse<RequestPaymentResponseDto> = await firstValueFrom(response$);
    return this._parsePaymentResponse(response.data);
  }

  private _parsePaymentResponse(response: RequestPaymentResponseDto): PaymentResponseDto {
    return this._classValidatorUtil
      .validateSyncAndResult(response?.data, RequestPaymentResponseDataDto)
      .map((validResponse: RequestPaymentResponseDataDto) => validResponse.id)
      .mapLeft((_error: unknown) => PaymentError.UNKNOWN_PAYMENT_ERROR);
  }

  private _createPaymentBody(payment: PaymentDto, userId: string): RequestPaymentDto {
    return {
      ...this._createPaymentPartBody(payment),
      ...ArcApiService._createCustomerPartBody(userId),
      strategy_id: null,
    };
  }

  private _createPaymentPartBody(payment: PaymentDto): IPaymentInfoPart {
    return {
      total_value_in_cents: payment.realPriceInCents,
      amount_to_discount_in_cents: this._getDiscountedValueInCents(
        payment.realPriceInCents,
        payment.totalPriceWithDiscountInCents,
      ),
      number_of_installments: payment?.creditCard?.installments ?? 1,
      method: ArcApiService._mapPaymentType(payment.type),
      idempotence: payment.id,
    };
  }

  private static _createCustomerPartBody(userId: string): ICustomerInfoPart {
    return {
      tenant_ref: userId,
    };
  }

  private static _mapPaymentType(type: PaymentType): ExternalPaymentMethod {
    switch (type as PaymentType) {
      case PaymentType.BANKING_BILLET:
        return 'bank_slip';

      case PaymentType.CREDIT_CARD:
        return 'credit_card';

      case PaymentType.PIX:
        return 'pix';

      default:
        throw new UnknownDomainError();
    }
  }

  private _getDiscountedValueInCents(totalValue: number, valueWithDiscount: number): number {
    return this._currencyUtil
      .numToCurrency(totalValue, Currency.CENTS_PRECISION)
      .minusValue(valueWithDiscount, Currency.CENTS_PRECISION)
      .toInt();
  }

  private static _parseName(fullName: string): FullName {
    const words: ReadonlyArray<string> = fullName.trim().split(/ +/);
    if (words.length >= 2) return [words[0], words[words.length - 1]];
    else if (words.length === 1) return [words[0], ''];
    else throw 'invalid name';
  }

  private static _mapExternalStatusToInternalStatus(status: ExternalPaymentStatuses): PaymentStatus {
    switch (status) {
      case ExternalPaymentStatuses.CANCELLED:
        return PaymentStatus.UNPAID;

      case ExternalPaymentStatuses.CANCELLING:
        return PaymentStatus.PENDING;

      case ExternalPaymentStatuses.PAID:
        return PaymentStatus.PAID;

      case ExternalPaymentStatuses.PENDING:
        return PaymentStatus.PENDING;

      case ExternalPaymentStatuses.REFUNDED:
        return PaymentStatus.UNPAID;

      case ExternalPaymentStatuses.REFUNDING:
        return PaymentStatus.PENDING;

      case ExternalPaymentStatuses.UNPAID:
        return PaymentStatus.UNPAID;
    }
  }

  private static _mapExternalBankSlipResourceToInternal(
    bankSlipResource?: ArcBankSlipResource,
  ): PaymentBankingBillet | null {
    return bankSlipResource
      ? {
        barcode: bankSlipResource.barcode,
        link: bankSlipResource.barcode_link,
        expireAt: null,
      }
      : null;
  }

  private static _mapExternalPixResourceToInternal(pixResource?: ArcPixResource): PaymentPix | null {
    return pixResource
      ? {
        qrcode: pixResource.qr_code_image,
        qrcodeText: pixResource.qr_code,
      }
      : null;
  }

  private static _limitString(word: string, maxChars: number = 30, defaults: string = 'Não informado'): string {
    return typeof word === 'string' ? word.substring(0, maxChars) : defaults;
  }

  private _createCustomerBody(
    firstName: string,
    lastName: string,
    params: Omit<AddUserParams, 'consents' | 'password'>,
  ): Omit<ICreateCustomer, 'tenant_ref'> {
    return {
      document: params.cpf,
      first_name: firstName,
      last_name: lastName,
      phone: params.phoneNumber,
      email: params.email,
      street: ArcApiService._limitString(params.address.street),
      number: ArcApiService._limitString(params.address.number),
      neighborhood: ArcApiService._limitString(params.address.neighborhood),
      city: ArcApiService._limitString(params.address.city, 50, 'São Paulo'),
      state: ArcApiService._limitString(params.address.state, 2, 'SP'),
      zipcode: ArcApiService._limitString(params.address.zipCode, 8, '01153000'),
      complement: ArcApiService._limitString(params.address.complement, 30, 'Não informado'),
    };
  }

  private _fetchImgForBrandcard(brandname: string): string {
    const basepath: string = 'https://www.olhonocarro.com.br/img/';

    let filename: string;
    switch (brandname) {
      case 'american_express':
        filename = 'american-express.svg';
        break;

      case 'diners_club':
        filename = 'diners.svg';
        break;

      case 'discover':
        filename = 'discover.svg';
        break;

      case 'elo':
        filename = 'elo.svg';
        break;

      case 'jcb':
        filename = 'jcb.svg';
        break;

      case 'maestro':
        filename = 'maestro.svg';
        break;

      case 'master_card':
        filename = 'mastercard.svg';
        break;

      case 'unionpay':
        filename = 'unionpay.svg';
        break;

      case 'visa':
        filename = 'visa.svg';
        break;

      default:
        filename = '';
        break;
    }

    return basepath + filename;
  }
}
