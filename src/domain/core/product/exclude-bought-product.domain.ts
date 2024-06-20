import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  NotFoundMyCarDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductEntity } from 'src/domain/_entity/my-car-product.entity';

export type ExcludeProductBoughtDomainErrors =
  | UnknownDomainError
  | ProviderUnavailableDomainError
  | NoUserFoundDomainError
  | NotFoundMyCarDomainError;

export type ExcludeProductBoughtResult = Either<ExcludeProductBoughtDomainErrors, MyCarProductEntity>;

export type ExcludeProductBoughtIO = EitherIO<ExcludeProductBoughtDomainErrors, MyCarProductEntity>;

export abstract class ExcludeProductBoughtDomain {
  abstract excludeById(id: string, userId: string): ExcludeProductBoughtIO;
}
