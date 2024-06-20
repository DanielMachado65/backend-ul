import { EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  InvalidPaymentStateForOperationDomainError,
  NfeAlreadyCreatedDomainError,
  NoPaymentFoundDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../_entity/result.error';
import { NfeDto } from '../../_layer/data/dto/nfe.dto';

export type CreateInvoiceDomainErrors =
  | UnknownDomainError
  | NoUserFoundDomainError
  | NoPaymentFoundDomainError
  | InvalidPaymentStateForOperationDomainError
  | NfeAlreadyCreatedDomainError
  | ProviderUnavailableDomainError;

export type CreateInvoiceIO = EitherIO<CreateInvoiceDomainErrors, NfeDto>;

export abstract class CreateNfeDomain {
  readonly createNfe: (paymentId: string) => CreateInvoiceIO;
}
