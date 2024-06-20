import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryDatasheet } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryDatasheetDomainErrors =
  | UnknownDomainError
  | ProviderUnavailableDomainError
  | ProviderNoDataForSelectedVersion;

export type QueryDatasheetResult = Either<QueryDatasheetDomainErrors, MyCarQueryDatasheet>;

export type QueryDatasheetIO = EitherIO<QueryDatasheetDomainErrors, MyCarQueryDatasheet>;

export abstract class QueryDatasheetDomain {
  abstract execute(userId: string, carId: string): QueryDatasheetIO;
}
