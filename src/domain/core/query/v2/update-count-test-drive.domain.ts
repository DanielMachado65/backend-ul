import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { TotalTestDriveDto } from 'src/domain/_layer/data/dto/total-test-drive.dto';

export type UpdateCountTestDriveErrors = UnknownDomainError;

export type UpdateCountTestDriveResult = Either<UpdateCountTestDriveErrors, TotalTestDriveDto>;

export type UpdateCountTestDriveIO = EitherIO<UpdateCountTestDriveErrors, TotalTestDriveDto>;

export abstract class UpdateCountTestDriveDomain {
  abstract execute(token: string): UpdateCountTestDriveIO;
}
