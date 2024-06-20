import { Either } from '@alissonfpmorais/minimal_fp';
import { PaymentGatewayType } from 'src/domain/_entity/payment.entity';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { AddUserParams } from 'src/domain/core/user/add-user.domain';
import { CreditCardMinimalDto } from '../../data/dto/credit-card-minimal.dto';
import { CreditCardDto } from '../../data/dto/credit-card.dto';
import { ExternalSubscriptionDto } from '../../data/dto/external-subscription.dto';
import { ExternalPaymentStateDto, PaymentResponseDto } from '../../data/dto/payment-response.dto';
import { PaymentDto } from '../../data/dto/payment.dto';
import { UserDto } from '../../data/dto/user.dto';

export interface IUserDataValidatedResponse {
  readonly isValid: boolean;
  readonly errorMsg: string;
}

export interface IUserDataToValidate {
  readonly username: string;
}

export type NecessaryDataForCustomer = UserDto;
export type ExternalCustomerIdType = string;
export type InternalUserIdType = string;

export interface ITelemetryHeadersParam {
  readonly userId?: string;
  readonly paymentId?: string;
}

export interface ICreateCustomerOptions {
  readonly ensurePossibleToCreatePayment: boolean;
}

export type CreateSubscription = {
  readonly user: UserDto;
  readonly idempotence: string;
  readonly recurringCycle: 'monthly';
  readonly recurringValueInCents: number;
  readonly ensureWorkingDay: boolean;
  readonly minDaysBeforeDue: number;
  readonly minDaysBeforeExpire: number;
  readonly strategyRef: string | null;
  readonly creditCardRef: string;
};

export type CreditCardWithSubscriptions = {
  readonly creditCard: CreditCardMinimalDto;
  readonly externalSubscriptions: ReadonlyArray<ExternalSubscriptionDto>;
};

export type CreditCardsWithSubscriptions = ReadonlyArray<CreditCardWithSubscriptions>;

export type CreditCardGeneralError = {
  readonly generalDescription: string;
  readonly details: {
    readonly subscriptionRef?: string;
    readonly type?: string;
  };
};

export class ThingsLockingCreditCard {
  constructor(public readonly errors: ReadonlyArray<CreditCardGeneralError>) {}
}

export abstract class PaymentGatewayService {
  abstract gateway: PaymentGatewayType;

  abstract createCardToken(
    creditCardDto: CreditCardDto,
    userId: string,
    reqParentId: string,
  ): Promise<Either<ProviderUnavailableDomainError, TokenEntity>>;

  abstract createCustomerIfNotExists(
    necessaryDataForCustomer: NecessaryDataForCustomer,
    cnpj: string,
    reqParentId: string,
    opts?: ICreateCustomerOptions,
  ): Promise<ExternalCustomerIdType>;

  abstract createCustomer(
    necessaryDataForCustomer: NecessaryDataForCustomer,
    cnpj: string,
    reqParentId: string,
    opts?: ICreateCustomerOptions,
  ): Promise<ExternalCustomerIdType>;

  abstract paymentWithBankSlip(
    userId: InternalUserIdType,
    payment: PaymentDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto>;

  abstract paymentWithCreditCard(
    userId: InternalUserIdType,
    payment: PaymentDto,
    cardToken: TokenEntity,
    reqParentId: string,
  ): Promise<PaymentResponseDto>;

  abstract paymentWithPix(
    userId: InternalUserIdType,
    payment: PaymentDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto>;

  abstract fetchPayment(
    externalPaymentId: string,
    cnpj: string,
    reqParentId: string,
    telemetryParams?: ITelemetryHeadersParam,
  ): Promise<ExternalPaymentStateDto>;

  abstract validateUser(params: AddUserParams, cnpj: string, reqParentId: string): Promise<IUserDataValidatedResponse>;

  abstract getCreditCardOfUser(userRef: string, creditCardRef: string, cnpj: string): Promise<CreditCardMinimalDto>;

  abstract listCreditCardsOfUser(userRef: string, cnpj: string): Promise<CreditCardsWithSubscriptions>;

  abstract saveCreditCard(userRef: string, creditCard: CreditCardDto, cnpj: string): Promise<CreditCardMinimalDto>;

  abstract removeCreditCard(
    userRef: string,
    creditCardRef: string,
    cnpj: string,
  ): Promise<Either<ThingsLockingCreditCard, CreditCardMinimalDto>>;

  abstract fetchSubscription(externalSubscriptionId: string, cnpj: string): Promise<ExternalSubscriptionDto>;

  abstract createSubscription(subscriptionParams: CreateSubscription, cnpj: string): Promise<ExternalSubscriptionDto>;

  abstract cancelSubscription(subscriptionRef: string, userId: string, cnpj: string): Promise<ExternalSubscriptionDto>;

  abstract changeCreditCardSubscription(
    _subscriptionRef: string,
    _userId: string,
    _creditCardRef: string,
    _cnpj: string,
  ): Promise<ExternalSubscriptionDto>;
}
