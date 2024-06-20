import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { CreditCardDto } from 'src/domain/_layer/data/dto/credit-card.dto';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import {
  CreateCreditCardTokenDomain,
  CreateCreditCardTokenIO,
} from '../../../domain/support/payment/create-credit-card-token.domain';

@Injectable()
export class CreateCreditCardTokenUseCase implements CreateCreditCardTokenDomain {
  constructor(private readonly _paymentGatewayService: PaymentGatewayService) {}

  createCreditCardToken(dto: CreditCardDto, userId: string, reqParentId: string): CreateCreditCardTokenIO {
    return EitherIO.fromEither(ProviderUnavailableDomainError.toFn(), () => {
      return this._paymentGatewayService.createCardToken(dto, userId, reqParentId);
    });
  }
}
