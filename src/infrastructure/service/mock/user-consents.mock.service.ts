import { Injectable } from '@nestjs/common';

import { ChannelType, UserConsents } from 'src/domain/_entity/user-consents.entity';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';

@Injectable()
export class UserConsentsMockService implements ConsentsService {
  async createUserConsentBatch(
    userId: string,
    consentVariations: ReadonlyArray<UserConsents>,
  ): Promise<ReadonlyArray<UserConsents>> {
    return consentVariations;
  }

  getUserConsents(_userId: string): Promise<never> {
    throw new Error('Method not implemented.');
  }

  updateUserConsent(_consentId: string, _userId: string, _hasGivenConsent: boolean): Promise<never> {
    throw new Error('Method not implemented.');
  }

  createConsent(_userId: string, _consents: UserConsents): Promise<void> {
    throw new Error('Method not implemented.');
  }

  isGivenConsent(_userId: string, _channel: ChannelType): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
