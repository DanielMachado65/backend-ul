import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  CarNotFoundError,
  CarSubscriptionDeactivatedFoundError,
  ProviderNoDataForSelectedVersion,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from 'src/domain/_entity/result.error';
import { MyCarQueryRevisionPlan } from 'src/domain/_layer/presentation/dto/my-car-queries.dto';

export type QueryRevisionPlanDomainErrors =
  | UnknownDomainError
  | CarNotFoundError
  | CarSubscriptionDeactivatedFoundError
  | ProviderUnavailableDomainError
  | ProviderNoDataForSelectedVersion;

export type QueryRevisionPlanResult = Either<QueryRevisionPlanDomainErrors, MyCarQueryRevisionPlan>;

export type QueryRevisionPlanIO = EitherIO<QueryRevisionPlanDomainErrors, MyCarQueryRevisionPlan>;

export abstract class QueryRevisionPlanDomain {
  abstract execute(userId: string, carId: string): QueryRevisionPlanIO;
}
