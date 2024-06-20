import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryMainFlaws } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryMainFlawsDomainErrors =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError
  | ProviderUnavailableDomainError;

export type QueryMainFlawsResult = Either<QueryMainFlawsDomainErrors, MyCarQueryMainFlaws>;

export type QueryMainFlawsIO = EitherIO<QueryMainFlawsDomainErrors, MyCarQueryMainFlaws>;

export abstract class QueryMainFlawsDomain {
  abstract execute(userId: string, carId: string): QueryMainFlawsIO;
}
