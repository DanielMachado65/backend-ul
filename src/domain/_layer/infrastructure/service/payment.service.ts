import { TokenEntity } from '../../../_entity/token.entity';
import { CartDto } from '../../data/dto/cart.dto';
import { CreditCardDto } from '../../data/dto/credit-card.dto';
import { PaymentResponseDto } from '../../data/dto/payment-response.dto';

export abstract class PaymentService {
  abstract createCreditCardToken(creditCard: CreditCardDto, reqParentId: string): Promise<TokenEntity>;
  abstract paymentWithBankSlip(
    userId: string,
    authToken: string,
    cart: CartDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto>;
  abstract paymentWithCreditCard(
    userId: string,
    authToken: string,
    cardToken: string,
    cart: CartDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto>;
  abstract paymentWithPix(
    userId: string,
    authToken: string,
    cart: CartDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto>;
}
