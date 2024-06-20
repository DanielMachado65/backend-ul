import { Injectable } from '@nestjs/common';
import { NFe, NfeService } from '../../../domain/_layer/infrastructure/service/nfe.service';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { PaymentDto } from '../../../domain/_layer/data/dto/payment.dto';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { InvalidObjectDomainError } from '../../../domain/_entity/result.error';

@Injectable()
export class ENotasMockService implements NfeService {
  generateNfe(
    _description: string,
    _paymentDto: PaymentDto,
    _userDto: UserDto,
  ): EitherIO<InvalidObjectDomainError, NFe> {
    return EitherIO.of(InvalidObjectDomainError.toFn(), null);
  }

  fetchInvoice(_externalNfeId: string, _cnpj: string): Promise<NFe> {
    throw new Error('Method not implemented.');
  }
}
