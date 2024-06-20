import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';

import {
  BlacklistKeysDomainError,
  DataNotFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { TestDriveQueryKeys } from 'src/domain/_entity/test-drive-query.entity';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';

export type RequestTestDriveDomainErrors =
  | UnknownDomainError
  | DataNotFoundDomainError
  | ProviderUnavailableDomainError
  | BlacklistKeysDomainError;

export type RequestTestDriveResult = Either<RequestTestDriveDomainErrors, Partial<TestDriveQueryDto>>;

export type RequestTestDriveIO = EitherIO<RequestTestDriveDomainErrors, Partial<TestDriveQueryDto>>;

export abstract class RequestTestDriveDomain {
  static readonly QUERY_CODE: number = 1000;

  readonly requestTestDrive: (
    keys: TestDriveQueryKeys,
    ip: string,
    mayBeUser: string,
    userCity: string,
    isAsync?: boolean,
  ) => RequestTestDriveIO;
}
