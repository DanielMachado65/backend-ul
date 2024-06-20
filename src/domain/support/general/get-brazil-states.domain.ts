import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { StateDto } from 'src/domain/_layer/data/dto/state.dto';

export type GetBrazilStatesErrors = ProviderUnavailableDomainError;

export type GetBrazilStatesResult = Either<GetBrazilStatesErrors, ReadonlyArray<StateDto>>;

export type GetBrazilStatesIO = EitherIO<GetBrazilStatesErrors, ReadonlyArray<StateDto>>;

export abstract class GetBrazilStatesDomain {
  abstract getStates(): GetBrazilStatesIO;
}
