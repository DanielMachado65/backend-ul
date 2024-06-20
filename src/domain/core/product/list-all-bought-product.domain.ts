import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductEntity } from 'src/domain/_entity/my-car-product.entity';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';

export type ListAllBoughtProductDomainErrors = UnknownDomainError;

export type ListAllBoughtProductResult = Either<ListAllBoughtProductDomainErrors, PaginationOf<MyCarProductEntity>>;

export type ListAllBoughtProductIO = EitherIO<ListAllBoughtProductDomainErrors, PaginationOf<MyCarProductEntity>>;

export abstract class ListAllBoughtProductDomain {
  abstract listAll(userId: string, page?: number, perPage?: number): ListAllBoughtProductIO;
}
