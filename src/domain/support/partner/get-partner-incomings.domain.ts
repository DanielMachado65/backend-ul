import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { IncomingGroupedByCouponDto } from '../../_layer/data/dto/incoming-grouped-by-coupon.dto';
import { UnknownDomainError } from '../../_entity/result.error';

export type PartnerIncomingDomainErrors = UnknownDomainError;

export type PartnerIncomingsResult = Either<PartnerIncomingDomainErrors, ReadonlyArray<IncomingGroupedByCouponDto>>;

export type PartnerIncomingsIO = EitherIO<PartnerIncomingDomainErrors, ReadonlyArray<IncomingGroupedByCouponDto>>;

export abstract class PartnerIncomingDomain {
  readonly getPartnerIncomings: (userId: string, month: number, year: number) => PartnerIncomingsIO;
}
