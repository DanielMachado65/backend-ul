import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { AppTokenRegisteredDto } from 'src/domain/_layer/data/dto/app-token-registered.dto';

export type RegisterAppTokenDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type RegisterAppTokenResult = Either<RegisterAppTokenDomainErrors, AppTokenRegisteredDto>;

export type RegisterAppTokenIO = EitherIO<RegisterAppTokenDomainErrors, AppTokenRegisteredDto>;

export abstract class RegisterAppTokenDomain {
  abstract addToken(userId: string, appToken: string): RegisterAppTokenIO;
}
