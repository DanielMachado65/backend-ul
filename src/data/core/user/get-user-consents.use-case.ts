import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetUserConsentsDomain, GetUserConsentsIO } from 'src/domain/core/user/get-user-consents.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { ConsentsService } from 'src/domain/_layer/infrastructure/service/user-consents.service';

@Injectable()
export class GetUserConsentsUseCase implements GetUserConsentsDomain {
  constructor(private readonly _consentsService: ConsentsService) {}

  getConsents(userId: string): GetUserConsentsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._consentsService.getUserConsents(userId));
  }
}
