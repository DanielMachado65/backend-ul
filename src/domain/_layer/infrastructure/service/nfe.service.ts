import { PaymentDto } from '../../data/dto/payment.dto';
import { UserDto } from '../../data/dto/user.dto';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { InvalidObjectDomainError } from '../../../_entity/result.error';

export type NFe = {
  externalId: string;
  number: string | null;
  confirmationNumber: string | null;
};

export abstract class NfeService {
  abstract generateNfe(
    description: string,
    paymentDto: PaymentDto,
    userDto: UserDto,
  ): EitherIO<InvalidObjectDomainError, NFe>;

  abstract fetchInvoice(externalNfeId: string, cnpj: string): Promise<NFe>;
}
