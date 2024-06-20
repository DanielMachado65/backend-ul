import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError, UserAlreadyBoughtDomainError } from 'src/domain/_entity/result.error';
import { CouponInfo } from 'src/domain/_layer/data/dto/coupon-info.dto';

export type GiveCouponForNewUserDomainErrors = UnknownDomainError | UserAlreadyBoughtDomainError;

export type GiveCouponForNewUserResult = Either<GiveCouponForNewUserDomainErrors, CouponInfo>;

export type GiveCouponForNewUserIO = EitherIO<GiveCouponForNewUserDomainErrors, CouponInfo>;

export abstract class GiveCouponForNewUserDomain {
  readonly giveTheCouponForUser: (userId: string) => GiveCouponForNewUserIO;
}
