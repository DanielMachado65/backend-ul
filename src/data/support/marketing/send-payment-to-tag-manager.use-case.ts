import { CouponDto } from '../../../domain/_layer/data/dto/coupon.dto';
import { CouponRepository } from '../../../domain/_layer/infrastructure/repository/coupon.repository';
import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import {
  PaymentEventDto,
  TagManagerDto,
  TagManagerService,
} from '../../../domain/_layer/infrastructure/service/tag-manager.service';
import { PaymentItem } from '../../../domain/_entity/payment.entity';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import {
  SendPaymentToTagManagerDomain,
  SendPaymentToTagManagerIO,
} from '../../../domain/support/marketing/send-payment-to-tag-manager.domain';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';

type Step1 = { readonly paymentDto: PaymentDto };
type Step2 = Step1 & { readonly userDto: UserDto };
type Step3 = Step2 & { readonly couponDto: CouponDto | null };

@Injectable()
export class SendPaymentToTagManagerUseCase implements SendPaymentToTagManagerDomain {
  constructor(
    private readonly _couponRepository: CouponRepository,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _userRepository: UserRepository,
    private readonly _tagManagerService: TagManagerService,
  ) {}

  send(paymentId: string): SendPaymentToTagManagerIO {
    return this._getPayment(paymentId)
      .flatMap<Step2>(this._getUser.bind(this))
      .flatMap<Step3>(this._getCoupon.bind(this))
      .map(SendPaymentToTagManagerUseCase._makeTagManagerDto)
      .map<boolean>(this._dispatchToTagManager.bind(this))
      .catch(SendPaymentToTagManagerUseCase._recover);
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

  private _getCoupon(payload: Step2): EitherIO<UnknownDomainError, Step3> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._couponRepository.getById(payload.paymentDto.couponId),
    ).map((couponDto: CouponDto) => ({ ...payload, couponDto: couponDto || null }));
  }

  private static _makeTagManagerDto(payload: Step3): TagManagerDto<PaymentEventDto> {
    return {
      userId: payload.userDto.id,
      userEmail: payload.userDto.email,
      events: [
        {
          paymentId: payload.paymentDto.id,
          paymentType: payload.paymentDto.type,
          totalPaidInCents: payload.paymentDto.totalPaidInCents,
          couponName: payload.couponDto?.code || null,
          items: payload.paymentDto.items.map((item: PaymentItem) => ({
            productId: item.queryId || item.packageId || item.signatureId,
            productName: item.name,
            amount: item.amount,
            unitPriceInCents: item.unitValueInCents,
          })),
        },
      ],
    };
  }

  private _dispatchToTagManager(tagManagerDto: TagManagerDto): Promise<boolean> {
    return this._tagManagerService.dispatchPaymentSucceed(tagManagerDto);
  }

  private static _recover<Left = unknown>(_error: Left): Either<Left, boolean> {
    return Either.right(false);
  }
}
