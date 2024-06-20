import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';

export type UserLogReportFormat = {
  readonly ID: string;
  readonly Ação: string;
  readonly Descrição: string;
  readonly Token: string;
  readonly Data: string;
};

export type DownloadUserLogsErrors = ProviderUnavailableDomainError;

export type DownloadUserLogsResult = Either<DownloadUserLogsErrors, Buffer>;

export type DownloadUserLogsIO = EitherIO<DownloadUserLogsErrors, Buffer>;

export abstract class DownloadUserLogsDomain {
  abstract getAll(userId: string): DownloadUserLogsIO;
}
