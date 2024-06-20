import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// class Package {
//   @ApiProperty()
//   id: string;
//
//   @ApiProperty()
//   amount: number;
// }
//
// class Query {
//   @ApiProperty()
//   code: number;
//
//   @ApiProperty()
//   amount: number;
// }
//
// class Products {
//   @ApiProperty({ type: [Package] })
//   packages: ReadonlyArray<Package>;
//
//   @ApiProperty({ type: [Query] })
//   queries: ReadonlyArray<Query>;
// }
//
// class Cart {
//   @ApiProperty({ type: () => Products })
//   products: Products;
//
//   @ApiProperty({ example: 'COUPON_X' })
//   coupon: string;
// }
//
// class DebtsCreditCard {
//   @ApiProperty({ example: '1234123412341234' })
//   number: string;
//
//   @ApiProperty({ example: 'mastercard' })
//   brand: string;
//
//   @ApiProperty({ example: 'João da Silva' })
//   holder: string;
//
//   @ApiProperty({ example: '0125' })
//   expirationDate: string;
//
//   @ApiProperty({ example: '123' })
//   cvv: string;
// }
//
// class Charge {
//   @ApiProperty({ type: () => Cart })
//   cart: Cart;
//
//   @ApiProperty({ type: () => DebtsCreditCard })
//   debtsCreditCard: DebtsCreditCard;
// }
//
// class BankingBilletProps {
//   @ApiProperty()
//   readonly expireAt: string | undefined;
//
//   @ApiProperty()
//   readonly barcode?: string;
//
//   @ApiProperty()
//   readonly link?: string;
// }
//
// class PixProps {
//   @ApiProperty()
//   readonly qrcode: string;
//
//   @ApiProperty()
//   readonly qrcodeText: string;
// }
//
// class PaymentItemDto {
//   @ApiProperty()
//   readonly name: string;
//
//   @ApiProperty()
//   readonly realValue: number;
//
//   @ApiProperty()
//   readonly value: number;
//
//   @ApiProperty()
//   readonly amount: number;
//
//   @ApiProperty()
//   readonly queryId: string | undefined;
//
//   @ApiProperty()
//   readonly packageid: string | undefined;
//
//   @ApiProperty()
//   readonly signatureId: string | undefined;
//
//   @ApiProperty()
//   readonly _id: string;
// }
//
// class PaymentDto {
//   @ApiProperty()
//   readonly _id: string;
//
//   @ApiProperty()
//   readonly chargeId: string;
//
//   @ApiProperty()
//   readonly discountValue?: number;
//
//   @ApiProperty()
//   readonly paid: boolean;
//
//   @ApiProperty()
//   readonly paymentDate: string | null;
//
//   @ApiProperty()
//   readonly realPrice: number;
//
//   @ApiProperty()
//   readonly status: string | undefined;
//
//   @ApiProperty()
//   readonly totalPaid: number;
//
//   @ApiProperty()
//   readonly totalPrice: number;
//
//   @ApiProperty()
//   readonly type: string;
//
//   @ApiProperty({ type: () => BankingBilletProps })
//   readonly bankingBillet: BankingBilletProps;
//
//   @ApiProperty({ type: () => PixProps })
//   readonly pix?: PixProps;
//
//   @ApiProperty({ type: () => PaymentItemDto, isArray: true })
//   readonly items: ReadonlyArray<PaymentItemDto>;
//
//   @ApiProperty()
//   readonly billing: string;
//
//   @ApiProperty()
//   readonly coupon: string | undefined;
//
//   @ApiProperty()
//   readonly createAt: string;
//
//   @ApiProperty()
//   readonly __v: number;
// }
//
// class PaymentSuccess {
//   @ApiProperty()
//   status: number;
//
//   @ApiProperty()
//   body: PaymentDto;
// }
//
// class PaymentError {
//   @ApiProperty()
//   status: number;
//
//   @ApiProperty()
//   body: string;
// }

@ApiBearerAuth()
@ApiTags('Pagamento')
@Controller('payment')
export class PaymentController {
  // @Post('bank-billet')
  // @ApiBody({ type: () => Charge })
  // @ApiParam({ name: 'userId' })
  // @ApiOperation({ summary: 'Execute payment with banking billet method (Legacy)' })
  // @ApiOkResponse({ description: 'Payment executed successfully', type: PaymentSuccess })
  // @ApiGoneResponse({ description: 'Payment failed to execute', type: PaymentError })
  // @ApiInternalServerErrorResponse({ description: 'Payment failed to execute', type: PaymentError })
  // @Roles([UserRoles.GUEST])
  // paymentWithBankingBillet(): Promise<null> {
  //   return Promise.resolve(null);
  // }
  //
  // @Post('v2')
  // @ApiBody({ type: () => Charge })
  // @ApiParam({ name: 'userId' })
  // @ApiOperation({ summary: 'Execute payment with credit card method (Legacy)' })
  // @ApiOkResponse({ status: 200, description: 'Payment executed successfully', type: PaymentSuccess })
  // @ApiUnauthorizedResponse({ status: 401, description: 'Payment failed to execute', type: PaymentError })
  // @ApiMethodNotAllowedResponse({ status: 405, description: 'Payment failed to execute', type: PaymentError })
  // @ApiInternalServerErrorResponse({ status: 500, description: 'Payment failed to execute', type: PaymentError })
  // @Roles([UserRoles.GUEST])
  // paymentWithCreditCard(): Promise<null> {
  //   return Promise.resolve(null);
  // }
  //
  // @Post('pix')
  // @ApiBody({ type: () => Charge })
  // @ApiParam({ name: 'userId' })
  // @ApiOperation({ summary: 'Execute payment with pix method (Legacy)' })
  // @ApiOkResponse({ status: 200, description: 'Payment executed successfully', type: PaymentSuccess })
  // @ApiUnauthorizedResponse({ status: 401, description: 'Payment failed to execute', type: PaymentError })
  // @ApiMethodNotAllowedResponse({ status: 405, description: 'Payment failed to execute', type: PaymentError })
  // @ApiInternalServerErrorResponse({ status: 500, description: 'Payment failed to execute', type: PaymentError })
  // @Roles([UserRoles.GUEST])
  // paymentWithPix(): Promise<null> {
  //   return Promise.resolve(null);
  // }
}
