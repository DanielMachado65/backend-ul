import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { BalanceEntity } from '../../_entity/balance.entity';
import { NoBalanceFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetUserCurrentBalanceDomainErrors = UnknownDomainError | NoBalanceFoundDomainError;

export type GetUserCurrentBalanceResult = Either<GetUserCurrentBalanceDomainErrors, BalanceEntity>;

export type GetUserCurrentBalanceIO = EitherIO<GetUserCurrentBalanceDomainErrors, BalanceEntity>;

export abstract class GetUserCurrentBalanceDomain {
  readonly getUserCurrentBalance: (userId: string) => GetUserCurrentBalanceIO;
}
