import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GiveOrRemoveConsentDomain, GiveOrRemoveConsentIO } from 'src/domain/core/user/give-or-remove-consent.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';

@Injectable()
export class GiveOrRemoveConsentUseCase implements GiveOrRemoveConsentDomain {
  constructor(private readonly _consentsService: ConsentsService) {}

  toggle(consentId: string, userId: string, hasGivenConsent: boolean): GiveOrRemoveConsentIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._consentsService.updateUserConsent(consentId, userId, hasGivenConsent),
    );
  }
}
