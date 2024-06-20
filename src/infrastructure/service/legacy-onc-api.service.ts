import { Either } from '@alissonfpmorais/minimal_fp';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, catchError, firstValueFrom, of } from 'rxjs';
import { ClientType } from '../../domain/_entity/client.entity';
import { QueryKeysEntity } from '../../domain/_entity/query-keys.entity';
import { QueryParsedData, QueryRepresentationEntity } from '../../domain/_entity/query-representation.entity';
import { QueryFailedService, QueryStatus } from '../../domain/_entity/query.entity';
import { TokenEntity } from '../../domain/_entity/token.entity';
import { CartDto, CartProductDto } from '../../domain/_layer/data/dto/cart.dto';
import { CreditCardDto } from '../../domain/_layer/data/dto/credit-card.dto';
import { PaymentError, PaymentResponseDto } from '../../domain/_layer/data/dto/payment-response.dto';
import { PaymentService } from '../../domain/_layer/infrastructure/service/payment.service';
import { QueryLegacyService } from '../../domain/_layer/infrastructure/service/query-legacy.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { LoggingAxiosInterceptor } from '../interceptor/logging-axios.interceptor';
import { CreditCardUtil } from '../util/credit-card.util';

type HttpResponse<Data> = {
  readonly status: number;
  readonly data?: Data;
};

type QueryHeader = {
  readonly status: boolean;
  readonly elapsedTimeInMS: number;
  readonly queryid: string;
  readonly name: string;
  readonly date: string;
  readonly code?: number;
  readonly keys?: {
    readonly placa?: string;
    readonly chassi?: string;
    readonly motor?: string;
  };
};

type RequestQueryBody = {
  readonly headerInfos: QueryHeader;
  readonly error?: Record<string, unknown>;
  readonly data?: Record<string, unknown> & {
    readonly placa: string;
    readonly marcaModelo: string;
    readonly readonly: string;
    readonly marcaImagem: string;
  };
  readonly queryDslResponse?: QueryParsedData;
  readonly servicesBroken?: ReadonlyArray<QueryFailedService>;
};

type RequestQueryResponse = {
  readonly body?: RequestQueryBody;
};

type IuguResponse = {
  readonly id: string;
};

type CreditCardData = {
  readonly iuguData: string;
  readonly asaasData: string;
};

export class LegacyCartPackageDto {
  id: string;
  amount: number;
}

export class LegacyCartQueryDto {
  code: number;
  amount: number;
}

export class LegacyCartSignatureDto {
  id: string;
  amount: number;
}

export class LegacyCartProductsDto {
  packages: ReadonlyArray<LegacyCartPackageDto>;
  queries: ReadonlyArray<LegacyCartQueryDto>;
  signatures: ReadonlyArray<LegacyCartSignatureDto>;
}

export class LegacyCartDto {
  type?: string;
  paymentToken?: string;
  coupon: string;
  products: LegacyCartProductsDto;
}

export class LegacyPaymentBody {
  total: number;
  dataCardEncrypted?: string;
  cart: LegacyCartDto;
}

type PaymentResponse = {
  readonly body: {
    readonly _id: string;
  };
};

@Injectable()
export class LegacyOncApiService implements QueryLegacyService, PaymentService {
  private static readonly TARGET_HEADER: string = 'legacy';

  private readonly _baseUrl: string;
  private readonly _iuguAccountId: string;
  private readonly _iuguBaseUrl: string;

  constructor(
    private readonly _httpService: HttpService,
    private readonly _envService: EnvService,
    private readonly _creditCardUtil: CreditCardUtil,
  ) {
    this._baseUrl = _envService.get(ENV_KEYS.LEGACY_API_BASE_URL);

    this._iuguAccountId = _envService.get(ENV_KEYS.IUGU_ACCOUNT_ID);
    this._iuguBaseUrl = _envService.get(ENV_KEYS.IUGU_API_BASE_URL);
  }

  private static _getHeaders(token: string): Record<string, string> {
    return token ? { Authorization: token, 'X-Paym-Origin': 'mobile' } : {};
  }

  private static _parseQueryResponse(response: RequestQueryResponse): QueryRepresentationEntity {
    const isQueryProcessing: boolean =
      !response.body?.headerInfos?.status &&
      Object.keys(response.body.data || {}).length <= 0 &&
      response.body?.headerInfos?.elapsedTimeInMS === 0;
    const status: QueryStatus = response.body?.headerInfos?.status
      ? QueryStatus.SUCCESS
      : isQueryProcessing
      ? QueryStatus.PENDING
      : QueryStatus.FAILURE;
    return response.body?.error
      ? null
      : {
          id: response.body?.headerInfos?.queryid,
          code: response.body?.headerInfos?.code,
          name: response.body?.headerInfos?.name,
          plate: response.body?.data?.placa,
          brandAndModel: response.body?.data?.marcaImagem,
          brandImageUrl: response.body?.data?.placa,
          createdAt: response.body?.headerInfos?.date,
          dsl: response.body?.queryDslResponse,
          failedServices: response.body.servicesBroken,
          keys: response.body?.headerInfos?.keys && {
            plate: response.body.headerInfos.keys.placa,
            chassis: response.body.headerInfos.keys.chassi,
            engine: response.body.headerInfos.keys.motor,
          },
          status,
          queryStatus: status,
          rules: [],
        };
  }

  private static _getCreditCardToken(cardToken: string): CreditCardData {
    return JSON.parse(Buffer.from(cardToken, 'base64').toString('utf8'));
  }

  private static _makePaymentBody(cart: CartDto, type?: string, cardToken?: string): LegacyPaymentBody {
    const { iuguData: paymentToken, asaasData: dataCardEncrypted }: CreditCardData = cardToken
      ? LegacyOncApiService._getCreditCardToken(cardToken)
      : { iuguData: null, asaasData: null };
    return {
      total: Number.MAX_SAFE_INTEGER,
      dataCardEncrypted: dataCardEncrypted,
      cart: {
        type: type,
        paymentToken: paymentToken,
        coupon: cart.coupon,
        products: {
          packages: cart.products.packages.map((pack: CartProductDto) => ({ id: pack.code, amount: pack.amount })),
          queries: cart.products.queries.map((query: CartProductDto) => ({ ...query, code: parseInt(query.code) })),
          signatures: cart.products.subscriptions.map((sub: CartProductDto) => ({ id: sub.code, amount: sub.amount })),
        },
      },
    };
  }

  private _parseCreateCreditCardToken(response: AxiosResponse<IuguResponse>, creditCard: CreditCardDto): TokenEntity {
    const iuguData: string = response.data.id;
    const asaasData: string = Buffer.from(
      JSON.stringify({
        cardNumber: creditCard.number,
        cardMonth: this._creditCardUtil.getMonth(creditCard),
        cardYear: this._creditCardUtil.getFullYear(creditCard),
        cardHolderName: creditCard.holderName,
        cardCcv: creditCard.securityCode,
      }),
    ).toString('base64');
    const token: string = Buffer.from(JSON.stringify({ iuguData, asaasData })).toString('base64');
    return { token };
  }

  private static _parsePaymentWithBankSlipResponse(response: HttpResponse<PaymentResponse>): PaymentResponseDto {
    return response.status === 200
      ? Either.right(response.data.body._id)
      : response.status === 401
      ? Either.left(PaymentError.UNKNOWN_PAYMENT_ERROR)
      : Either.left(PaymentError.UNKNOWN_PAYMENT_ERROR);
  }

  private static _parsePaymentWithCreditCardResponse(response: HttpResponse<PaymentResponse>): PaymentResponseDto {
    return response.status === 200
      ? Either.right(response.data.body._id)
      : response.status === 401
      ? Either.left(PaymentError.UNKNOWN_PAYMENT_ERROR)
      : Either.left(PaymentError.UNKNOWN_PAYMENT_ERROR);
  }

  private static _parsePaymentWithPixResponse(response: HttpResponse<PaymentResponse>): PaymentResponseDto {
    return response.status === 200
      ? Either.right(response.data.body._id)
      : response.status === 401
      ? Either.left(PaymentError.UNKNOWN_PAYMENT_ERROR)
      : Either.left(PaymentError.UNKNOWN_PAYMENT_ERROR);
  }

  async requestQuery(
    token: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): Promise<QueryRepresentationEntity> {
    const url: string = this._baseUrl + '/api/vehicle/v2?client=' + clientType;
    const headers: Record<string, string> = LegacyOncApiService._getHeaders(token);
    const toKeys: Record<string, unknown> = {
      placa: keys.plate,
      chassi: keys.chassis,
      motor: keys.engine,
      cep: keys.zipCode,
    };
    const body: Record<string, unknown> = { queryCode, keys: toKeys, duplicity: mayDuplicate };
    const response$: Observable<AxiosResponse<RequestQueryResponse>> = this._httpService.post(url, body, { headers });
    const response: AxiosResponse<RequestQueryResponse> = await firstValueFrom(response$);
    return LegacyOncApiService._parseQueryResponse(response.data);
  }

  async createCreditCardToken(creditCard: CreditCardDto, reqParentId: string): Promise<TokenEntity> {
    const url: string = this._iuguBaseUrl + '/payment_token';
    const body: Record<string, unknown> = {
      account_id: this._iuguAccountId,
      method: 'credit_card',
      test: this._envService.isDevEnv(),
      data: {
        number: creditCard.number,
        verification_value: creditCard.securityCode,
        first_name: this._creditCardUtil.getFirstName(creditCard),
        last_name: this._creditCardUtil.getLastName(creditCard),
        month: this._creditCardUtil.getMonth(creditCard),
        year: this._creditCardUtil.getFullYear(creditCard),
      },
    };
    const response$: Observable<AxiosResponse<IuguResponse>> = this._httpService.post(url, body, {
      headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, 'iugu'),
    });
    const response: AxiosResponse<IuguResponse> = await firstValueFrom(response$);
    return this._parseCreateCreditCardToken(response, creditCard);
  }

  async paymentWithBankSlip(
    userId: string,
    authToken: string,
    cart: CartDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto> {
    const url: string = this._baseUrl + '/api/payment/bank-billet/' + userId;
    const headers: Record<string, string> = LegacyOncApiService._getHeaders(authToken);
    const body: LegacyPaymentBody = LegacyOncApiService._makePaymentBody(cart, 'banking_billet');
    const response$: Observable<HttpResponse<PaymentResponse>> = this._httpService
      .post(url, body, {
        headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, LegacyOncApiService.TARGET_HEADER, headers),
      })
      .pipe(catchError((err: AxiosError) => of(err.toJSON() as HttpResponse<PaymentResponse>)));
    const response: HttpResponse<PaymentResponse> = await firstValueFrom(response$);
    return LegacyOncApiService._parsePaymentWithBankSlipResponse(response);
  }

  async paymentWithCreditCard(
    userId: string,
    authToken: string,
    cardToken: string,
    cart: CartDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto> {
    const url: string = this._baseUrl + '/api/payment/v2/' + userId;
    const headers: Record<string, string> = LegacyOncApiService._getHeaders(authToken);
    const body: LegacyPaymentBody = LegacyOncApiService._makePaymentBody(cart, 'credit_card', cardToken);
    const response$: Observable<HttpResponse<PaymentResponse>> = this._httpService
      .post(url, body, {
        headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, LegacyOncApiService.TARGET_HEADER, headers),
      })
      .pipe(catchError((err: AxiosError) => of(err.toJSON() as HttpResponse<PaymentResponse>)));
    const response: HttpResponse<PaymentResponse> = await firstValueFrom(response$);
    return LegacyOncApiService._parsePaymentWithCreditCardResponse(response);
  }

  async paymentWithPix(
    userId: string,
    authToken: string,
    cart: CartDto,
    reqParentId: string,
  ): Promise<PaymentResponseDto> {
    const url: string = this._baseUrl + '/api/payment/pix/' + userId;
    const headers: Record<string, string> = LegacyOncApiService._getHeaders(authToken);
    const body: LegacyPaymentBody = LegacyOncApiService._makePaymentBody(cart, 'pix');
    const response$: Observable<HttpResponse<PaymentResponse>> = this._httpService
      .post(url, body, {
        headers: LoggingAxiosInterceptor.makeLogHeaders(reqParentId, LegacyOncApiService.TARGET_HEADER, headers),
      })
      .pipe(catchError((err: AxiosError) => of(err.toJSON() as HttpResponse<PaymentResponse>)));
    const response: HttpResponse<PaymentResponse> = await firstValueFrom(response$);
    return LegacyOncApiService._parsePaymentWithPixResponse(response);
  }
}
