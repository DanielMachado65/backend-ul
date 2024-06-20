import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { PostalCodeInfo } from 'src/domain/_layer/data/dto/postal-code-info.dto';

export type GetCityFromPostalCodeBrazilErrors = ProviderUnavailableDomainError;

export type GetCityFromPostalCodeBrazilResult = Either<GetCityFromPostalCodeBrazilErrors, PostalCodeInfo>;

export type GetCityFromPostalCodeBrazilIO = EitherIO<GetCityFromPostalCodeBrazilErrors, PostalCodeInfo>;

export abstract class GetCityFromPostalCodeBrazilDomain {
  abstract getFromPostalCode(code: string): GetCityFromPostalCodeBrazilIO;
}
