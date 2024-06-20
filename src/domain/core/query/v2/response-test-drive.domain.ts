import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import {
  DataNotFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../../_entity/result.error';

export type ResponseTestDriveDomainErrors =
  | UnknownDomainError
  | DataNotFoundDomainError
  | ProviderUnavailableDomainError;

export type ResponseTestDriveResult = Either<ResponseTestDriveDomainErrors, void>;

export type ResponseTestDriveIO = EitherIO<ResponseTestDriveDomainErrors, void>;

export abstract class ResponseTestDriveDomain {
  readonly responseTestDrive: (queryResponse: QueryResponseDto) => ResponseTestDriveIO;
}
