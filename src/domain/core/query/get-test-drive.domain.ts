import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  DataNotFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { TestDriveQueryResponseEntity } from 'src/domain/_entity/test-drive-query.entity';

export type GetTestDriveDomainErrors = UnknownDomainError | DataNotFoundDomainError | ProviderUnavailableDomainError;

export type GetTestDriveResult = Either<GetTestDriveDomainErrors, TestDriveQueryResponseEntity>;

export type GetTestDriveIO = EitherIO<GetTestDriveDomainErrors, TestDriveQueryResponseEntity>;

export abstract class GetTestDriveDomain {
  getTestDrive: (queryId: string) => GetTestDriveIO;
}
