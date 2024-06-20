import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { ConsentDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { ChannelType, ConsentType } from 'src/domain/_entity/user-consents.entity';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';
import { GiveConsentDomain, GiveConsentIO } from 'src/domain/core/user/give-consent.domain';

@Injectable()
export class GiveZapayConsentUseCase implements GiveConsentDomain {
  constructor(private readonly _consentsService: ConsentsService) {}

  create(userId: string): GiveConsentIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .filter(ConsentDomainError.toFn(), this._validateUserId())
      .map(this._createConsent());
  }

  private _validateUserId() {
    return (userId: string): boolean => !!userId;
  }

  private _createConsent() {
    return async (userId: string): Promise<void> => {
      await this._consentsService.createConsent(userId, {
        channelType: ChannelType.ZAPAY,
        consentType: ConsentType.PAYMENT_READ,
        hasGivenConsent: true,
      });
    };
  }
}
