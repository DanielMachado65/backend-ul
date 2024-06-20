import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoUserFoundDomainError } from 'src/domain/_entity/result.error';
import { AccountFundsDto } from 'src/domain/_layer/data/dto/account-funds.dto';

export type GetUserCurrentAccountFundsDomainErrors = NoUserFoundDomainError;

export type GetUserCurrentAccountFundsDtoResult = Either<GetUserCurrentAccountFundsDomainErrors, AccountFundsDto>;

export type GetUserCurrentAccountFundsResult = Either<GetUserCurrentAccountFundsDomainErrors, number>;

export type GetUserCurrentAccountFundsIO = EitherIO<GetUserCurrentAccountFundsDomainErrors, number>;

export abstract class GetUserAccountFundsDomain {
  readonly getUserAccountFunds: (userId: string) => GetUserCurrentAccountFundsIO;
}
