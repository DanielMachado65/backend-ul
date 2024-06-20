import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ServiceEntity } from '../../_entity/service.entity';
import { NoProductFoundDomainError, UnknownDomainError } from '../../_entity/result.error';

export type GetServicesFromQueryComposerDomainErrors = UnknownDomainError | NoProductFoundDomainError;

export type GetServicesFromQueryComposerResult = Either<
  GetServicesFromQueryComposerDomainErrors,
  ReadonlyArray<ServiceEntity>
>;

export type GetServicesFromQueryComposerIO = EitherIO<
  GetServicesFromQueryComposerDomainErrors,
  ReadonlyArray<ServiceEntity>
>;

export abstract class GetServicesFromQueryComposerDomain {
  readonly getServicesFromQueryComposer: (queryComposerId: string) => GetServicesFromQueryComposerIO;
}
