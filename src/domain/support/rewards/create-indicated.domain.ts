import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { IndicatedNotProcessDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';
import { IndicatedInputDto } from 'src/domain/_layer/presentation/dto/indicated-input.dto';

export type CreateIndicatedDomainErrors = UnknownDomainError | IndicatedNotProcessDomainError;

export type CreateIndicateResult = Either<CreateIndicatedDomainErrors, IndicatedDto>;

export type CreateIndicateIO = EitherIO<CreateIndicatedDomainErrors, IndicatedDto>;

export abstract class CreateIndicatedDomain {
  readonly create: ({ email, participantId }: IndicatedInputDto) => CreateIndicateIO;
}
