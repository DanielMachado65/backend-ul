import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  NoBillingFoundDomainError,
  NoCouponFoundDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';
import { PartnerIncomingDto } from '../../_layer/data/dto/partner-incoming.dto';

export type AddPartnerIncomingDomainErrors =
  | UnknownDomainError
  | NoCouponFoundDomainError
  | NoUserFoundDomainError
  | NoBillingFoundDomainError;

export type AddPartnerIncomingResult = Either<AddPartnerIncomingDomainErrors, PartnerIncomingDto>;

export type AddPartnerIncomingIO = EitherIO<AddPartnerIncomingDomainErrors, PartnerIncomingDto>;

export abstract class AddPartnerIncomingDomain {
  readonly addPartnerIncoming: (paymentId: string) => AddPartnerIncomingIO;
}
