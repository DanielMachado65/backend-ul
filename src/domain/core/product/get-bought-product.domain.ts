import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { MyCarProductEntity } from 'src/domain/_entity/my-car-product.entity';

export type GetBoughtProductDomainErrors = UnknownDomainError;

export type GetBoughtProductResult = Either<GetBoughtProductDomainErrors, MyCarProductEntity>;

export type GetBoughtProductIO = EitherIO<GetBoughtProductDomainErrors, MyCarProductEntity>;

export abstract class GetBoughtProductDomain {
  abstract getById(id: string, userId: string): GetBoughtProductIO;
}
