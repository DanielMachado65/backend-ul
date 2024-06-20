import { Either } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { AddUserAtPaymentGatewayDomain } from 'src/domain/core/user/add-user-at-payment-gateway.domain';
import { GetPaymentDomain } from 'src/domain/support/payment/get-payment.domain';
import { ReqParentId } from 'src/infrastructure/middleware/http-log.middleware';
import { PollingUtil } from 'src/infrastructure/util/polling.util';
import { UserAgentUtil } from 'src/infrastructure/util/user-agent.util';
import { PaymentCreationOrigin, PaymentEntity, PaymentStatus } from '../../../domain/_entity/payment.entity';
import {
  CantProcessPaymentDomainError,
  NoPaymentFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { TokenEntity } from '../../../domain/_entity/token.entity';
import { PaymentStatusDto } from '../../../domain/_layer/data/dto/payment-status.dto';
import { CreateCreditCardTokenInputDto } from '../../../domain/_layer/presentation/dto/create-credit-card-token-input.dto';
import { GetPaymentStatusInputDto } from '../../../domain/_layer/presentation/dto/get-payment-status-input.dto';
import { PaymentWithBankSlipInputDto } from '../../../domain/_layer/presentation/dto/payment-with-bank-slip-input.dto';
import { PaymentWithCreditCardInputDto } from '../../../domain/_layer/presentation/dto/payment-with-credit-card-input.dto';
import { PaymentWithPixInputDto } from '../../../domain/_layer/presentation/dto/payment-with-pix-input.dto';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';
import {
  CreateCreditCardTokenDomain,
  CreateCreditCardTokenResult,
} from '../../../domain/support/payment/create-credit-card-token.domain';
import {
  GetPaymentStatusDomain,
  GetPaymentStatusResult,
} from '../../../domain/support/payment/get-payment-status.domain';
import {
  PaymentWithBankSlipDomain,
  PaymentWithBankSlipResult,
} from '../../../domain/support/payment/payment-with-bank-slip.domain';
import {
  PaymentWithCreditCardDomain,
  PaymentWithCreditCardResult,
} from '../../../domain/support/payment/payment-with-credit-card.domain';
import { PaymentWithPixDomain, PaymentWithPixResult } from '../../../domain/support/payment/payment-with-pix.domain';
import {
  ApiErrorResponseMake,
  ApiOkResponseMake,
} from '../../../infrastructure/framework/swagger/setup/swagger-builders';
import { Roles } from '../../../infrastructure/guard/roles.guard';
import { UserInfo } from '../../../infrastructure/middleware/user-info.middleware';

@ApiTags('Pagamento')
@Controller('payment')
export class PaymentController {
  constructor(
    private readonly _addUserAtPaymentGatewayDomain: AddUserAtPaymentGatewayDomain,
    private readonly _createCreditCardDomain: CreateCreditCardTokenDomain,
    private readonly _getPaymentDomain: GetPaymentDomain,
    private readonly _getPaymentStatusDomain: GetPaymentStatusDomain,
    private readonly _paymentWithBankSlipDomain: PaymentWithBankSlipDomain,
    private readonly _paymentWithCreditCardDomain: PaymentWithCreditCardDomain,
    private readonly _paymentWithPixDomain: PaymentWithPixDomain,
    private readonly _userAgentUtil: UserAgentUtil,
  ) {}

  @ApiBearerAuth()
  @Post('/card-token')
  @ApiOperation({ summary: 'Create a credit card token' })
  @ApiOkResponseMake(TokenEntity)
  @ApiErrorResponseMake([ProviderUnavailableDomainError])
  @Roles([UserRoles.REGULAR])
  async createCreditCardToken(
    @ReqParentId() reqParentId: string,
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: CreateCreditCardTokenInputDto,
  ): Promise<CreateCreditCardTokenResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._createCreditCardDomain.createCreditCardToken(inputDto.creditCard, userId, reqParentId).safeRun();
  }

  @ApiBearerAuth()
  @Post('/bank-slip')
  @ApiOperation({ summary: 'Execute payment with bank slip method' })
  @ApiOkResponseMake(PaymentEntity)
  @ApiErrorResponseMake([UnknownDomainError, CantProcessPaymentDomainError])
  @Roles([UserRoles.REGULAR])
  @Span('payment-v3')
  async paymentWithBankSlip(
    @ReqParentId() reqParentId: string,
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: PaymentWithBankSlipInputDto,
    @Req() req: Request,
  ): Promise<PaymentWithBankSlipResult> {
    const paymentOrigin: PaymentCreationOrigin = this._extractPaymentOrigin(req);
    const userId: string = userInfo.maybeUserId ?? '';
    return this._addUserAtPaymentGatewayDomain
      .addUserAtGateway(userId, reqParentId, { ensurePossibleToCreatePayment: true })
      .catch(() => Either.right(null))
      .flatMap(() =>
        this._paymentWithBankSlipDomain.paymentWithBankSlip(userId, inputDto.cart, reqParentId, {
          origin: paymentOrigin,
        }),
      )
      .tap((dto: PaymentDto) =>
        this._paymentPolling(
          userId,
          dto.id,
          (res: GetPaymentStatusResult) => res.isRight() && Boolean(res.getRight().bankingBillet?.link),
        ),
      )
      .flatMap((dto: PaymentDto) => this._getPaymentDomain.getPayment(dto.id))
      .safeRun();
  }

  @ApiBearerAuth()
  @Post('/credit-card')
  @ApiOperation({ summary: 'Execute payment with credit card method' })
  @ApiOkResponseMake(PaymentEntity)
  @ApiErrorResponseMake([UnknownDomainError, CantProcessPaymentDomainError])
  @Roles([UserRoles.REGULAR])
  @Span('payment-v3')
  async paymentWithCreditCard(
    @ReqParentId() reqParentId: string,
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: PaymentWithCreditCardInputDto,
    @Req() req: Request,
  ): Promise<PaymentWithCreditCardResult> {
    const paymentOrigin: PaymentCreationOrigin = this._extractPaymentOrigin(req);
    const userId: string = userInfo.maybeUserId ?? '';
    return this._addUserAtPaymentGatewayDomain
      .addUserAtGateway(userId, reqParentId, { ensurePossibleToCreatePayment: true })
      .catch(() => Either.right(null))
      .flatMap(() =>
        this._paymentWithCreditCardDomain.paymentWithCreditCard(
          userId,
          { token: inputDto.token },
          inputDto.cart,
          reqParentId,
          { origin: paymentOrigin },
        ),
      )
      .tap((dto: PaymentDto) =>
        this._paymentPolling(
          userId,
          dto.id,
          (res: GetPaymentStatusResult) => res.isRight() && res.getRight().status !== PaymentStatus.PENDING,
        ),
      )
      .flatMap((dto: PaymentDto) => this._getPaymentDomain.getPayment(dto.id))
      .safeRun();
  }

  @ApiBearerAuth()
  @Post('/pix')
  @ApiOperation({ summary: 'Execute payment with pix method' })
  @ApiOkResponseMake(PaymentEntity)
  @ApiErrorResponseMake([UnknownDomainError, CantProcessPaymentDomainError])
  @Roles([UserRoles.REGULAR])
  @Span('payment-v3')
  async paymentWithPix(
    @ReqParentId() reqParentId: string,
    @UserInfo() userInfo: UserInfo,
    @Body() inputDto: PaymentWithPixInputDto,
    @Req() req: Request,
  ): Promise<PaymentWithPixResult> {
    const paymentOrigin: PaymentCreationOrigin = this._extractPaymentOrigin(req);
    const userId: string = userInfo.maybeUserId ?? '';
    return this._addUserAtPaymentGatewayDomain
      .addUserAtGateway(userId, reqParentId, { ensurePossibleToCreatePayment: true })
      .catch(() => Either.right(null))
      .flatMap(() =>
        this._paymentWithPixDomain.paymentWithPix(userId, inputDto.cart, reqParentId, { origin: paymentOrigin }),
      )
      .tap((dto: PaymentDto) =>
        this._paymentPolling(
          userId,
          dto.id,
          (res: GetPaymentStatusResult) => res.isRight() && Boolean(res.getRight().pix?.qrcode),
        ),
      )
      .flatMap((dto: PaymentDto) => this._getPaymentDomain.getPayment(dto.id))
      .safeRun();
  }

  @ApiBearerAuth()
  @Get('/:paymentId/status')
  @ApiOperation({ summary: 'get payment status' })
  @ApiOkResponseMake(PaymentStatusDto)
  @ApiErrorResponseMake([UnknownDomainError, NoPaymentFoundDomainError])
  @Roles([UserRoles.REGULAR])
  @Span('payment-v3')
  getPaymentStatus(
    @UserInfo() userInfo: UserInfo,
    @Param() inputDto: GetPaymentStatusInputDto,
  ): Promise<GetPaymentStatusResult> {
    const userId: string = userInfo.maybeUserId ?? '';
    return this._getPaymentStatusDomain
      .getPaymentStatus(userId, inputDto.paymentId)
      .map((dto: PaymentStatusDto) => ({
        ...dto,
        status: dto.status === PaymentStatus.PENDING ? PaymentStatus.UNPAID : dto.status,
      }))
      .safeRun();
  }

  private async _paymentPolling(
    userId: string,
    paymentId: string,
    predicate: (res: GetPaymentStatusResult) => boolean,
  ): Promise<GetPaymentStatusResult> {
    return PollingUtil.polling(3_000, 120_000, predicate, () =>
      this._getPaymentStatusDomain.getPaymentStatus(userId, paymentId).safeRun(),
    );
  }

  private _extractPaymentOrigin(req: Request): PaymentCreationOrigin {
    const userAgent: string = req.headers['user-agent'];
    const paymentOriginByAgent: PaymentCreationOrigin = this._userAgentUtil.isMobile(userAgent)
      ? PaymentCreationOrigin.MOBILE
      : PaymentCreationOrigin.UNKNOWN;
    const paymentOrigin: string = req.headers['x-paym-origin'] as string;

    switch (paymentOrigin) {
      case 'website':
        return PaymentCreationOrigin.WEBSITE;
      case 'mobile':
        return PaymentCreationOrigin.MOBILE;
      default:
        return paymentOriginByAgent;
    }
  }
}
