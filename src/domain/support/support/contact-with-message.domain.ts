import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { ContractSupportDto } from 'src/domain/_layer/presentation/dto/contact-support.dto';

export type ContactWithMessageDomainErrors = ProviderUnavailableDomainError;

export type ContactWithMessageResult = Either<ContactWithMessageDomainErrors, void>;

export type ContactWithMessageIO = EitherIO<ContactWithMessageDomainErrors, void>;

export abstract class ContactWithMessageDomain {
  abstract contact(params: ContractSupportDto): ContactWithMessageIO;
}
