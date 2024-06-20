import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { ContractSupportDto } from 'src/domain/_layer/presentation/dto/contact-support.dto';
import { ContactWithMessageDomain, ContactWithMessageIO } from 'src/domain/support/support/contact-with-message.domain';

@Injectable()
export class ContactWithMessageUseCase implements ContactWithMessageDomain {
  constructor(private readonly _notificationServiceGen: NotificationServiceGen) {}

  contact(params: ContractSupportDto): ContactWithMessageIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._notificationServiceGen.dispatch(NotificationTransport.EMAIL, NotificationType.CONTACT_SUPPORT, params),
    )
      .filter(ProviderUnavailableDomainError.toFn(), Boolean)
      .map(() => undefined);
  }
}
