import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type CouponsCreatedByUserErrors = UnknownDomainError;

export type CountCouponsCreatedByUserResult = Either<CouponsCreatedByUserErrors, number>;

export type CountCouponsCreatedByUserIO = EitherIO<CouponsCreatedByUserErrors, number>;

export abstract class CountCouponsCreatedByUserDomain {
  abstract countCouponsCreatedByUser(userId: string): CountCouponsCreatedByUserIO;
}
