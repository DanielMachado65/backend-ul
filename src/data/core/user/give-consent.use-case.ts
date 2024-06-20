import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { ConsentDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UserConsents } from 'src/domain/_entity/user-consents.entity';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { GiveConsentDomain, GiveConsentIO } from 'src/domain/core/user/give-consent.domain';

@Injectable()
export class GiveConsentUseCase implements GiveConsentDomain {
  constructor(private readonly _consentsService: ConsentsService) {}

  create(userId: string, consentId: string, consents: UserConsents): GiveConsentIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .filter(ConsentDomainError.toFn(), this._validateUserId())
      .map(this._createOrUpdateConsent(consentId, consents));
  }

  private _validateUserId() {
    return (userId: string): boolean => !!userId;
  }

  private _createOrUpdateConsent(consentId: string, consents: UserConsents) {
    return async (userId: string): Promise<void> => {
      if (!!consentId) {
        await this._consentsService.updateUserConsent(consentId, userId, consents.hasGivenConsent);
      } else {
        await this._consentsService.createConsent(userId, consents);
      }
    };
  }
}
