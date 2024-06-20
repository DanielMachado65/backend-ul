import { Either } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PaymentEntity, PaymentGatewayType, PaymentStatus } from 'src/domain/_entity/payment.entity';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { CreditCardMinimalDto } from 'src/domain/_layer/data/dto/credit-card-minimal.dto';
import { CreditCardDto } from 'src/domain/_layer/data/dto/credit-card.dto';
import { ExternalSubscriptionDto } from 'src/domain/_layer/data/dto/external-subscription.dto';
import { ExternalPaymentStateDto, PaymentResponseDto } from 'src/domain/_layer/data/dto/payment-response.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import {
  CreditCardsWithSubscriptions,
  ITelemetryHeadersParam,
  IUserDataValidatedResponse,
  PaymentGatewayService,
  ThingsLockingCreditCard,
} from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { AddUserParams } from 'src/domain/core/user/add-user.domain';
import { TestUtil } from 'src/infrastructure/repository/test/test.util';

@Injectable()
export class ArcApiMockService implements PaymentGatewayService {
  gateway: PaymentGatewayType = PaymentGatewayType.ARC;

  async createCardToken(
    _creditCardDto: CreditCardDto,
    _userId: string,
    _reqParentId: string,
  ): Promise<Either<ProviderUnavailableDomainError, TokenEntity>> {
    throw new Error('Method not implemented.');
  }

  async fetchSubscription(_externalPaymentId: string, _cnpj: string): Promise<ExternalSubscriptionDto> {
    throw new Error('Method not implemented.');
  }

  async fetchPayment(
    _externalPaymentId: string,
    _cnpj: string,
    _reqParentId: string,
    _telemetryParams?: ITelemetryHeadersParam,
  ): Promise<ExternalPaymentStateDto> {
    return {
      status: PaymentStatus.PENDING,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: null,
      details: {
        currentGateway: {
          referenceIn: '_',
          gateway: '_',
        },
      },
      paidAt: new Date().toISOString(),
    };
  }

  async createCreditCardToken(_creditCard: CreditCardDto): Promise<TokenEntity> {
    return { token: TestUtil.generateId() };
  }

  async createCustomerIfNotExists(_necessaryDataForCustomer: UserDto): Promise<string> {
    return TestUtil.generateId();
  }

  async createCustomer(_necessaryDataForCustomer: UserDto): Promise<string> {
    return TestUtil.generateId();
  }

  async paymentWithBankSlip(_userId: string, _payment: PaymentDto, _reqParentId: string): Promise<PaymentResponseDto> {
    return Either.right(TestUtil.generateId());
  }

  async paymentWithCreditCard(
    _userId: string,
    _payment: PaymentDto,
    _cardToken: TokenEntity,
    _reqParentId: string,
  ): Promise<PaymentResponseDto> {
    return Either.right(TestUtil.generateId());
  }

  async paymentWithPix(_userId: string, _payment: PaymentEntity, _reqParentId: string): Promise<PaymentResponseDto> {
    return Either.right(TestUtil.generateId());
  }

  async validateUser(_params: AddUserParams, _cnpj: string, _reqParentId: string): Promise<IUserDataValidatedResponse> {
    return { isValid: true, errorMsg: '' };
  }

  getCreditCardOfUser(_userRef: string, _creditCardRef: string, _cnpj: string): Promise<CreditCardMinimalDto> {
    throw new Error('Method not implemented.');
  }

  listCreditCardsOfUser(_userRef: string, _cnpj: string): Promise<CreditCardsWithSubscriptions> {
    throw new Error('Method not implemented.');
  }

  saveCreditCard(_userRef: string, _creditCard: CreditCardDto, _cnpj: string): Promise<CreditCardMinimalDto> {
    throw new Error('Method not implemented.');
  }

  removeCreditCard(
    _userRef: string,
    _creditCardRef: string,
    _cnpj: string,
  ): Promise<Either<ThingsLockingCreditCard, CreditCardMinimalDto>> {
    throw new Error('Method not implemented.');
  }

  createSubscription(_subscriptionParams: unknown, _cnpj: string): Promise<ExternalSubscriptionDto> {
    throw new Error('Method not implemented.');
  }

  cancelSubscription(_subscriptionRef: string, _userId: string, _cnpj: string): Promise<ExternalSubscriptionDto> {
    throw new Error('Method not implemented.');
  }

  changeCreditCardSubscription(
    _subscriptionRef: string,
    _userId: string,
    _creditCardRef: string,
    _cnpj: string,
  ): Promise<ExternalSubscriptionDto> {
    throw new Error('Method not implemented.');
  }

  changeSubscriptionCreditCard(
    _userId: string,
    _subscriptionId: string,
    _creditCardRef: string,
    _cnpj: string,
  ): Promise<ExternalSubscriptionDto> {
    throw new Error('Method not implemented.');
  }
}
