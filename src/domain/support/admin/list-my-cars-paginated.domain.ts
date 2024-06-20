import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';

export type ListMyCarPaginatedFilters = {
  email?: string | null;
  subscriptionId?: string | null;
  myCarId?: string | null;
  plate?: string | null;
};

export abstract class ListMyCarsPaginatedDomain {
  abstract listMyCarsPaginated(
    page: number,
    perPage: number,
    filters: ListMyCarPaginatedFilters,
  ): EitherIO<UnknownDomainError, unknown>;
}
