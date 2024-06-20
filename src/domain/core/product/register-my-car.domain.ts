import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  FirstFreeMyCarIsAvailableDomainError,
  MyCarAlreadyExistsDomainError,
  MyCarIsAlreadyRegisteredDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

export type RegisterMyCarDomainErrors =
  | UnknownDomainError
  | ProviderUnavailableDomainError
  | NoUserFoundDomainError
  | MyCarAlreadyExistsDomainError
  | MyCarIsAlreadyRegisteredDomainError
  | FirstFreeMyCarIsAvailableDomainError;

export type RegisterMyCarResult = Either<RegisterMyCarDomainErrors, MyCarProductDto>;

export type RegisterMyCarIO = EitherIO<RegisterMyCarDomainErrors, MyCarProductDto>;

export abstract class RegisterMyCarDomain {
  abstract registerPlate(userId: string, plate: string, fipeId: string, creditCardId?: string): RegisterMyCarIO;
}
