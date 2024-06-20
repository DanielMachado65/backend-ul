import {
  AddIndicatedPaymentDomain,
  AddIndicatedPaymentIO,
} from '../../../domain/support/partner/add-indicator-incoming.domain';
import { Injectable } from '@nestjs/common';
import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import {
  IndicateAndEarnService,
  TransactionCreditsDto,
} from '../../../domain/_layer/infrastructure/service/indicate-and-earn.service';

type Step1 = { readonly paymentDto: PaymentDto };
type Step2 = Step1 & { readonly userDto: UserDto };
type Step3 = Step2 & { readonly transactionCreditsDto: TransactionCreditsDto };

@Injectable()
export class AddIndicatedPaymentUseCase implements AddIndicatedPaymentDomain {
  constructor(
    private readonly _paymentRepository: PaymentRepository,
    private readonly _userRepository: UserRepository,
    private readonly _indicateAndEarnService: IndicateAndEarnService,
  ) {}

  addIndicatedPayment(paymentId: string): AddIndicatedPaymentIO {
    return this._getPayment(paymentId)
      .flatMap(this._getUser.bind(this))
      .map(AddIndicatedPaymentUseCase._makeTransactionCreditsDto)
      .flatMap(this._addTransactionCredits.bind(this));
  }

  private _getPayment(paymentId: string): EitherIO<UnknownDomainError | NoPaymentFoundDomainError, Step1> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(paymentId))
      .filter(NoPaymentFoundDomainError.toFn(), Boolean)
      .map((paymentDto: PaymentDto) => ({ paymentDto }));
  }

  private _getUser(payload: Step1): EitherIO<UnknownDomainError | NoUserFoundDomainError, Step2> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._userRepository.getByBillingId(payload.paymentDto.billingId),
    )
      .filter(NoUserFoundDomainError.toFn(), Boolean)
      .map((userDto: UserDto) => ({ ...payload, userDto }));
  }

  private static _makeTransactionCreditsDto(payload: Step2): Step3 {
    const { paymentDto, userDto }: Step2 = payload;
    const transactionCreditsDto: TransactionCreditsDto = {
      indicatedCpf: userDto.cpf,
      indicatedEmail: userDto.email,
      indicatedName: userDto.name,
      indicatedId: userDto.id,
      originValueInCents: paymentDto.totalPaidInCents,
    };

    return { ...payload, transactionCreditsDto };
  }

  private _addTransactionCredits(payload: Step3): EitherIO<UnknownDomainError, boolean> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._indicateAndEarnService.addTransactionCredit(payload.transactionCreditsDto),
    )
      .map(() => true)
      .catch(() => Either.right(false));
  }
}
