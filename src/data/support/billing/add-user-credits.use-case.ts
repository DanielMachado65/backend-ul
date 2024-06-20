import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Injectable } from '@nestjs/common';
import { PaymentStatus } from 'src/domain/_entity/payment.entity';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { PaymentRepository } from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  CreditsAlreadyAddedDomainError,
  InvalidPaymentStateForOperationDomainError,
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { BalanceDto } from '../../../domain/_layer/data/dto/balance.dto';
import { BalanceRepository } from '../../../domain/_layer/infrastructure/repository/balance.repository';
import { AddUserCreditsDomain, AddUserCreditsIO } from '../../../domain/support/billing/add-user-credits.domain';
import { TransactionHelper } from '../../../infrastructure/repository/transaction.helper';
import { BillingHelper } from './billing.helper';

@Injectable()
export class AddUserCreditsUseCase implements AddUserCreditsDomain {
  constructor(
    private readonly _billingHelper: BillingHelper,
    private readonly _transactionHelper: TransactionHelper,
    private readonly _balanceRepository: BalanceRepository,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _userRepository: UserRepository,
  ) {}

  @Span('payment-v3')
  addUserCreditsFromPayment(paymentId: string): AddUserCreditsIO {
    type Data = readonly [PaymentDto, UserDto];

    return this._getUser(paymentId)
      .zip(this._getPayment(paymentId), (user: UserDto, payment: PaymentDto) => [payment, user] as const)
      .flatMap(([payment, user]: Data) => {
        return EitherIO.from(UnknownDomainError.toFn(), () => this._balanceRepository.getByPaymentId(payment.id))
          .filter(CreditsAlreadyAddedDomainError.toFn(), (balanceDto: BalanceDto | null) => !balanceDto)
          .map(() => [payment, user] as const);
      })
      .flatMap(([payment, user]: Data) => this._addCredits(payment.realPriceInCents, user.id, null, payment.id));
  }

  addUserCredits(valueInCents: number, userId: string, assignerId?: string): AddUserCreditsIO {
    return this._addCredits(valueInCents, userId, assignerId, null);
  }

  private _getUser(paymentId: string): EitherIO<UnknownDomainError, UserDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getByPaymentId(paymentId)).filter(
      NoUserFoundDomainError.toFn(),
      Boolean,
    );
  }

  private _getPayment(paymentId: string): EitherIO<UnknownDomainError, PaymentDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(paymentId))
      .filter(NoPaymentFoundDomainError.toFn(), Boolean)
      .filter(
        InvalidPaymentStateForOperationDomainError.toFn(),
        (payment: PaymentDto) => payment.status === PaymentStatus.PAID,
      );
  }

  private _addCredits(
    valueInCents: number,
    userId: string,
    assignerId: string | null,
    paymentId: string | null,
  ): AddUserCreditsIO {
    return EitherIO.fromEither(UnknownDomainError.toFn(), () => {
      return this._transactionHelper.withTransaction((transactionRef: unknown) => {
        return this._billingHelper.updateUserCredits(transactionRef, valueInCents, userId, assignerId, null, paymentId);
      });
    });
  }
}
