import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';

export type GetTotalTestsDrivesErrors = UnknownDomainError;

export type GetTotalTestsDrivesResult = Either<GetTotalTestsDrivesErrors, TotalTestDriveDto>;

export type GetTotalTestsDrivesIO = EitherIO<GetTotalTestsDrivesErrors, TotalTestDriveDto>;

export abstract class GetTotalTestsDrivesDomain {
  readonly execute: () => GetTotalTestsDrivesIO;
}
