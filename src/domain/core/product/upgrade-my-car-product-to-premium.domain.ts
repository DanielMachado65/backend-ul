import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { SubscriptionEntity } from 'src/domain/_entity/subscription.entity';

export type UpgradeMyCarProductToPremiumDomainErrors = UnknownDomainError;

export type UpgradeMyCarProductToPremiumResult = Either<UpgradeMyCarProductToPremiumDomainErrors, SubscriptionEntity>;

export type UpgradeMyCarProductToPremiumIO = EitherIO<UpgradeMyCarProductToPremiumDomainErrors, SubscriptionEntity>;

export abstract class UpgradeMyCarProductToPremiumDomain {
  abstract upgrade(myCarProductId: string, userId: string, creditCardId: string): UpgradeMyCarProductToPremiumIO;
}
