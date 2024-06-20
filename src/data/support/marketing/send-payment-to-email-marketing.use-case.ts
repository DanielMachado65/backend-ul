import { DateTimeUtil } from '../../../infrastructure/util/date-time-util.service';
import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  MarkintingService,
  PaymentEmailMarketingDto,
} from '../../../domain/_layer/infrastructure/service/marketing.service';
import {
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { PaymentDebtsItem } from '../../../domain/_entity/payment.entity';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import {
  SendPaymentToEmailMarketingDomain,
  SendPaymentToEmailMarketingIO,
} from '../../../domain/support/marketing/send-payment-to-email-marketing.domain';
import { StringUtil } from '../../../infrastructure/util/string.util';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';

type Step1 = { readonly paymentDto: PaymentDto };
type Step2 = Step1 & { readonly userDto: UserDto };
type Step3 = Step2 & { readonly marketingDto: PaymentEmailMarketingDto };

@Injectable()
export class SendPaymentToEmailMarketingUseCase implements SendPaymentToEmailMarketingDomain {
  constructor(
    private readonly _paymentRepository: PaymentRepository,
    private readonly _userRepository: UserRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _marketingService: MarkintingService,
  ) {}

  send(paymentId: string): SendPaymentToEmailMarketingIO {
    return this._getPayment(paymentId)
      .flatMap(this._getUser.bind(this))
      .map(this._makeMarketingDto.bind(this))
      .tap(this._sendToEmailMarketing.bind(this))
      .map(() => true)
      .catch(SendPaymentToEmailMarketingUseCase._recover);
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

  private _makeMarketingDto(payload: Step2): Step3 {
    const createdAt: string = this._dateTimeUtil.fromIso(payload.userDto.createdAt).format('MM/YY');
    const marketingDto: PaymentEmailMarketingDto = {
      email: payload.userDto.email,
      firstName: StringUtil.firstName(payload.userDto.name),
      lastName: StringUtil.lastName(payload.userDto.name),
      phone: payload.userDto.phoneNumber || '',
      birthday: createdAt || '01/01',
      purchase: payload.paymentDto.items[0]?.name || '',
    };

    return { ...payload, marketingDto };
  }

  private _sendToEmailMarketing(payload: Step3): Promise<void> {
    const debtItems: ReadonlyArray<PaymentDebtsItem> = payload.paymentDto.debts?.items;
    return Array.isArray(debtItems) && debtItems.length > 0
      ? this._marketingService.registerUserPaidDebts(payload.marketingDto)
      : this._marketingService.registerUserPaid(payload.marketingDto);
  }

  private static _recover<Left = unknown>(_error: Left): Either<Left, boolean> {
    return Either.right(false);
  }
}
