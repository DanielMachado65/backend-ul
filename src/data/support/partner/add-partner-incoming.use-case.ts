import {
  AddPartnerIncomingDomain,
  AddPartnerIncomingIO,
} from '../../../domain/support/partner/add-partner-incoming.domain';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { BillingRepository } from '../../../domain/_layer/infrastructure/repository/billing.repository';
import { CouponDto } from '../../../domain/_layer/data/dto/coupon.dto';
import { CouponRepository } from '../../../domain/_layer/infrastructure/repository/coupon.repository';
import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  NoBillingFoundDomainError,
  NoCouponFoundDomainError,
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { PartnerIncomingDto } from '../../../domain/_layer/data/dto/partner-incoming.dto';
import { PartnerIncomingRepository } from '../../../domain/_layer/infrastructure/repository/partner-incoming.repository';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import { PaymentRepository } from '../../../domain/_layer/infrastructure/repository/payment.repository';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { UserType } from '../../../domain/_entity/user.entity';

type Step1 = { readonly payment: PaymentDto };
type Step2 = Step1 & { readonly paymentCount: number };
type Step3 = Step2 & { readonly maybeCoupon: CouponDto | null };
type Step4 = Step3 & { readonly maybeCreator: UserDto | null };
type Step5 = Step4 & { readonly userBilling: BillingDto };

@Injectable()
export class AddPartnerIncomingUseCase implements AddPartnerIncomingDomain {
  constructor(
    private readonly _billingRepository: BillingRepository,
    private readonly _couponRepository: CouponRepository,
    private readonly _partnerIncomingRepository: PartnerIncomingRepository,
    private readonly _paymentRepository: PaymentRepository,
    private readonly _userRepository: UserRepository,
  ) {}

  addPartnerIncoming(paymentId: string): AddPartnerIncomingIO {
    return this._getPayment(paymentId)
      .flatMap(this._getPaymentCountAndAppend.bind(this))
      .flatMap(this._getCouponAndAppend.bind(this))
      .flatMap(this._getCouponCreatorAndAppend.bind(this))
      .flatMap(this._getOrUpdateUserBilling.bind(this))
      .flatMap(this._insertPartnerIncomingIfEligible.bind(this));
  }

  private _getPayment(paymentId: string): EitherIO<UnknownDomainError, Step1> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._paymentRepository.getById(paymentId))
      .filter(NoPaymentFoundDomainError.toFn(), Boolean)
      .map((payment: PaymentDto) => ({ payment }));
  }

  private _getPaymentCountAndAppend(payload: Step1): EitherIO<UnknownDomainError, Step2> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._paymentRepository.countAllFromBillingId(payload.payment.billingId),
    )
      .map((count: number) => (count <= 0 ? 1 : count))
      .catch(() => Either.right(1))
      .map((count: number) => ({ ...payload, paymentCount: count }));
  }

  private _getCouponAndAppend(payload: Step2): EitherIO<UnknownDomainError | NoCouponFoundDomainError, Step3> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._couponRepository.getById(payload.payment.couponId)).map(
      (maybeCoupon: CouponDto) => ({ ...payload, maybeCoupon: maybeCoupon || null }),
    );
  }

  private _getCouponCreatorAndAppend(payload: Step3): EitherIO<UnknownDomainError | NoUserFoundDomainError, Step4> {
    const creatorId: string | null = payload.maybeCoupon?.creatorId;
    return creatorId === null
      ? EitherIO.of(UnknownDomainError.toFn(), { ...payload, maybeCreator: null })
      : EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(creatorId)).map(
          (maybeCreator: UserDto) => ({ ...payload, maybeCreator: maybeCreator || null }),
        );
  }

  private _getOrUpdateUserBilling(payload: Step4): EitherIO<UnknownDomainError | NoBillingFoundDomainError, Step5> {
    const billingId: string = payload.payment.billingId;
    const maybeCoupon: CouponDto | null = payload.maybeCoupon;

    return EitherIO.from(UnknownDomainError.toFn(), () => {
      return payload.paymentCount > 1
        ? this._billingRepository.getById(billingId)
        : this._billingRepository.updateById(billingId, {
            orderRoles: {
              hasUsedCouponOnFirstOrder: maybeCoupon !== null,
              couponId: maybeCoupon?.id || null,
              couponCode: maybeCoupon?.code || null,
              isPartnerCoupon: this._isPartner(payload.maybeCreator),
            },
          });
    })
      .filter(NoBillingFoundDomainError.toFn(), Boolean)
      .map((userBilling: BillingDto) => ({ ...payload, userBilling }));
  }

  private _insertPartnerIncomingIfEligible(payload: Step5): EitherIO<UnknownDomainError, PartnerIncomingDto> {
    const hasFirstBoughtWithPartnerCoupon: boolean = payload.userBilling.orderRoles?.isPartnerCoupon;
    const isPartnerCoupon: boolean = this._isPartner(payload.maybeCreator);

    return hasFirstBoughtWithPartnerCoupon && isPartnerCoupon
      ? EitherIO.from(UnknownDomainError.toFn(), () => {
          return this._partnerIncomingRepository.insert({
            partnerId: payload.maybeCreator?.id,
            userId: payload.userBilling.userId,
            paymentId: payload.payment.id,
            couponId: payload.maybeCoupon?.id,
            couponCode: payload.maybeCoupon?.code,
            incomingRefValueCents: payload.payment.totalPaidInCents,
          });
        })
      : EitherIO.of(UnknownDomainError.toFn(), null);
  }

  private _isPartner(maybeCreator: UserDto | null): boolean {
    return !!maybeCreator && maybeCreator.type !== UserType.MASTER;
  }
}
