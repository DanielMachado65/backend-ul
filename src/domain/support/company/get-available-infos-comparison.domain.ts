import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryInfoEssentialsDto } from 'src/domain/_layer/data/dto/query-info.dto';

export type AvailableInfosComparisonErrors = UnknownDomainError;

export type AvailableInfosComparisonResult = Either<
  AvailableInfosComparisonErrors,
  ReadonlyArray<QueryInfoEssentialsDto>
>;

export type AvailableInfosComparisonIO = EitherIO<
  AvailableInfosComparisonErrors,
  ReadonlyArray<QueryInfoEssentialsDto>
>;

export abstract class GetAvailableInfosComparisonDomain {
  abstract getComparisons(): AvailableInfosComparisonIO;
}
