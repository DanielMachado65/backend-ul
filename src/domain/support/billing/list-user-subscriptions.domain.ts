import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { PlanDto } from 'src/domain/_layer/data/dto/plan.dto';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';

export type ExtraInfo = {
  readonly creditCardLast4: string;
  readonly creditCardId: string;
  readonly plan: PlanDto;
};

export type ListUserSubscriptionsDomainErrors = UnknownDomainError | ProviderUnavailableDomainError;

export type ListUserSubscriptionsResult = Either<
  ListUserSubscriptionsDomainErrors,
  PaginationOf<SubscriptionDto & ExtraInfo>
>;

export type ListUserSubscriptionsIO = EitherIO<
  ListUserSubscriptionsDomainErrors,
  PaginationOf<SubscriptionDto & ExtraInfo>
>;

export abstract class ListUserSubscriptionsDomain {
  abstract listByUser(userId: string, page: number, perPage: number): ListUserSubscriptionsIO;
}
