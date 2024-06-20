import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryKeys } from 'src/domain/_entity/query.entity';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { QueryConfirmationDto } from 'src/domain/_layer/data/dto/query-confirmation.dto';

export type QueryConfirmationDomainErrors = ProviderUnavailableDomainError;

export type QueryConfirmationResult = Either<QueryConfirmationDomainErrors, QueryConfirmationDto>;

export type QueryConfirmationIO = EitherIO<QueryConfirmationDomainErrors, QueryConfirmationDto>;

export abstract class GetQueryConfirmationDomain {
  abstract getQueryConfirmation(keys: QueryKeys, userId: string): QueryConfirmationIO;
}
