import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import {
  ListMyCarPaginatedFilters,
  ListMyCarsPaginatedDomain,
} from 'src/domain/support/admin/list-my-cars-paginated.domain';

@Injectable()
export class ListMyCarsPaginatedUseCase implements ListMyCarsPaginatedDomain {
  constructor(private readonly _myCarProductRepository: MyCarProductRepository) {}

  listMyCarsPaginated(
    page: number,
    perPage: number,
    filters: ListMyCarPaginatedFilters,
  ): EitherIO<UnknownDomainError, unknown> {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._myCarProductRepository.listPaginatedMyCars(page, perPage, filters),
    );
  }
}
