import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionRelatedDataDto } from 'src/domain/_layer/presentation/dto/subscription-output.dto';

export type GetSubscriptionRelatedDataDomainErrors = UnknownDomainError;

export type GetSubscriptionRelatedDataResult = Either<
  GetSubscriptionRelatedDataDomainErrors,
  SubscriptionRelatedDataDto
>;

export type GetSubscriptionsRelatedDataResult = Either<
  GetSubscriptionRelatedDataDomainErrors,
  ReadonlyArray<SubscriptionRelatedDataDto>
>;

export type GetSubscriptionRelatedDataIO = EitherIO<GetSubscriptionRelatedDataDomainErrors, SubscriptionRelatedDataDto>;

export type GetSubscriptionsRelatedDataIO = EitherIO<
  GetSubscriptionRelatedDataDomainErrors,
  ReadonlyArray<SubscriptionRelatedDataDto>
>;

export abstract class GetSubscriptionRelatedDataDomain {
  abstract fromSingle(userId: string, subscriptionId: string): GetSubscriptionRelatedDataIO;
  abstract fromMultiple(userId: string, subscriptionIds: ReadonlyArray<string>): GetSubscriptionsRelatedDataIO;
}
