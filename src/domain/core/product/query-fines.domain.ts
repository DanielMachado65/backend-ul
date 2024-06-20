import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarQueryFines } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryFinesDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type QueryFinesResult = Either<QueryFinesDomainErrors, MyCarQueryFines>;

export type QueryFinesIO = EitherIO<QueryFinesDomainErrors, MyCarQueryFines>;

export abstract class QueryFinesDomain {
  abstract execute(userId: string, carId: string): QueryFinesIO;
}
