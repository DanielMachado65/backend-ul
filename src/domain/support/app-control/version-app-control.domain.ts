import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import {
  VersionAppContolResponseDto,
  VersionAppControlInputDto,
} from 'src/domain/_layer/data/dto/version-app-control.dto';

export type VersionAppContolErrors = UnknownDomainError;

export type VersionAppContolResult = Either<VersionAppContolErrors, VersionAppContolResponseDto>;

export type VersionAppContolIO = EitherIO<VersionAppContolErrors, VersionAppContolResponseDto>;

export abstract class VersionAppContolDomain {
  abstract validate(input: VersionAppControlInputDto): VersionAppContolIO;
}
