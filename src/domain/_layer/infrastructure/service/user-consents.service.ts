import { ChannelType, CompleteUserConsent, UserConsents } from 'src/domain/_entity/user-consents.entity';

export abstract class ConsentsService {
  abstract createUserConsentBatch(
    userId: string,
    consentVariations: ReadonlyArray<UserConsents>,
  ): Promise<ReadonlyArray<UserConsents>>;
  abstract getUserConsents(userId: string): Promise<ReadonlyArray<CompleteUserConsent>>;
  abstract updateUserConsent(consentId: string, userId: string, hasGivenConsent: boolean): Promise<CompleteUserConsent>;
  abstract createConsent(userId: string, consents: UserConsents): Promise<void>;
  abstract isGivenConsent(userId: string, channel: ChannelType): Promise<boolean>;
}
