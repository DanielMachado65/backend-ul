import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PeopleImpactedDto } from '../../_layer/data/dto/people-impacted.dto';

export type PeopleImpactedDomainErrors = UnknownDomainError;

export type PeopleImpactedResult = Either<PeopleImpactedDomainErrors, PeopleImpactedDto>;

export type PeopleImpactedIO = EitherIO<PeopleImpactedDomainErrors, PeopleImpactedDto>;

export abstract class PeopleImpactedDomain {
  readonly getPeopleImpacted: () => PeopleImpactedIO;
}
