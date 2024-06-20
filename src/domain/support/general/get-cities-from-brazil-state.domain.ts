import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { CityDto } from 'src/domain/_layer/data/dto/city.dto';

export type GetCitiesFromBrazilStateErrors = ProviderUnavailableDomainError;

export type GetCitiesFromBrazilStateResult = Either<GetCitiesFromBrazilStateErrors, ReadonlyArray<CityDto>>;

export type GetCitiesFromBrazilStateIO = EitherIO<GetCitiesFromBrazilStateErrors, ReadonlyArray<CityDto>>;

export abstract class GetCitiesFromBrazilStateDomain {
  abstract getCities(state: string): GetCitiesFromBrazilStateIO;
}
