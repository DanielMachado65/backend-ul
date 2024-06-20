import * as crypto from 'crypto';
import { AxiosResponse } from 'axios';
import { Currency, CurrencyUtil } from '../util/currency.util';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import {
  PaymentEventDto,
  PaymentEventItemDto,
  TagManagerDto,
  TagManagerService,
} from '../../domain/_layer/infrastructure/service/tag-manager.service';
import { PaymentType } from '../../domain/_entity/payment.entity';

enum PaymentMethod {
  BANK_SLIP = 'bank_slip',
  CREDIT_CARD = 'credit_card',
  PIX = 'pix',
}

type ExtPaymentEventParamsExtrasFacebookDto = {
  readonly user_email_hashed: string; // User's email hashed with SHA256
  readonly content_type: string; // Product's type (i.e.: "product" or "service")
  readonly content_ids: ReadonlyArray<string>; // Array of products IDs
  readonly content_name: ReadonlyArray<string>; // Array of products name
};

type ExtPaymentEventParamsExtrasDto = {
  readonly user_email: string; // User's email
  readonly payment_method: PaymentMethod; // Payment's method type
  readonly fbExtras: ExtPaymentEventParamsExtrasFacebookDto; // Facebook extras
};

type ExtPaymentEventParamsItemDto = {
  readonly item_id: string; // Product's ID
  readonly item_name: string; // Product's name
  readonly quantity: number; // Amount bought of the same product
  readonly discount: number; // Discount value in decimals
  readonly tax: number; // Tax value in decimals
  readonly price: number; // Product's unit price in decimals
  readonly currency: 'BRL';
};

type ExtPaymentEventParamsDto = {
  readonly transaction_id: string; // Payment's ID
  readonly affiliation: string; // Store's name
  readonly coupon: string; // Coupon name
  readonly currency: 'BRL';
  readonly shipping: number; // Shipping value in decimals
  readonly tax: number; // Tax value in decimals
  readonly value: number; // Total paid value in decimals
  readonly items: ReadonlyArray<ExtPaymentEventParamsItemDto>; // Products bought
  readonly extras: ExtPaymentEventParamsExtrasDto; // Any extra value for tags in Tag Manager
};

type ExtPaymentEventDto = {
  readonly name: 'purchase'; // Event name
  readonly params: ExtPaymentEventParamsDto; // Event params
};

type ExtTagManagerEventsDto = ExtPaymentEventDto;

type ExtTagManagerDto<Events> = {
  readonly client_id: string; // Unique identifier for web instance
  readonly user_id: string; // Unique identifier for user
  readonly non_personalized_ads: boolean; // Indicate if events should not be used for personalized ads
  readonly events: ReadonlyArray<Events>; // List of fired events
};

@Injectable()
export class GoogleTagManagerService implements TagManagerService {
  private readonly _url: string;

  constructor(
    private readonly _envService: EnvService,
    private readonly _httpService: HttpService,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    this._url = this._envService.get(ENV_KEYS.TAG_MANAGER_URL);
  }

  dispatchPaymentSucceed(payload: TagManagerDto<PaymentEventDto>): Promise<boolean> {
    const externalPayload: ExtTagManagerDto<ExtPaymentEventDto> = this._parsePaymentSucceedEventPayload(payload);
    return this._dispatchEvent(externalPayload);
  }

  private async _dispatchEvent(payload: ExtTagManagerDto<ExtTagManagerEventsDto>): Promise<boolean> {
    try {
      const response$: Observable<AxiosResponse> = this._httpService.post(this._url, payload);
      const response: AxiosResponse = await firstValueFrom(response$);
      return response.status === 200 || response.status === 201;
    } catch (_error) {
      return false;
    }
  }

  private _parsePaymentSucceedEventPayload(
    payload: TagManagerDto<PaymentEventDto>,
  ): ExtTagManagerDto<ExtPaymentEventDto> {
    return {
      client_id: payload.userId,
      user_id: payload.userId,
      non_personalized_ads: false,
      events: payload.events.map((event: PaymentEventDto) => ({
        name: 'purchase',
        params: {
          affiliation: 'Olho No Carro',
          transaction_id: event.paymentId,
          coupon: event.couponName,
          currency: 'BRL',
          tax: 0,
          shipping: 0,
          value: this._toReals(event.totalPaidInCents),
          items: event.items.map((item: PaymentEventItemDto) => ({
            item_id: item.productId,
            item_name: item.productName,
            currency: 'BRL',
            tax: 0,
            discount: 0,
            price: this._toReals(item.unitPriceInCents),
            quantity: item.amount,
          })),
          extras: {
            user_email: payload.userEmail,
            payment_method: this._parsePaymentMethodType(event.paymentType),
            fbExtras: {
              user_email_hashed: this._sha256Email(payload.userEmail),
              content_type: 'product',
              content_ids: event.items.map((item: PaymentEventItemDto) => item.productId),
              content_name: event.items.map((item: PaymentEventItemDto) => item.productName),
            },
          },
        },
      })),
    };
  }

  private _parsePaymentMethodType(paymentType: PaymentType): PaymentMethod {
    switch (paymentType) {
      case PaymentType.BANKING_BILLET:
        return PaymentMethod.BANK_SLIP;

      case PaymentType.CREDIT_CARD:
        return PaymentMethod.CREDIT_CARD;

      case PaymentType.PIX:
        return PaymentMethod.PIX;

      default:
        return null;
    }
  }

  private _toReals(value: number): number {
    return this._currencyUtil.numToCurrency(value, Currency.CENTS_PRECISION).toFloat();
  }

  private _sha256Email(email: string): string {
    return crypto.createHash('sha256').update(email).digest('base64');
  }
}
