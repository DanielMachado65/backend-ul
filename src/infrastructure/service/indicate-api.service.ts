import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable, firstValueFrom } from 'rxjs';
import { UnknownDomainError } from '../../domain/_entity/result.error';
import {
  HashLinkParams,
  IndicateAndEarnService,
  TransactionCreditsDto,
  TransactionDebitsWithdrawalDto,
  TransactionDebitsWithOncWalletDto,
  TransactionsDebit,
} from '../../domain/_layer/infrastructure/service/indicate-and-earn.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { IndicateAndEarnFundsDto } from 'src/domain/_layer/presentation/dto/indicate-and-earn-funds.dto';
import { IndicatedCoupon, IndicatedDto } from 'src/domain/_layer/data/dto/indicated.dto';
import { TransactionCredit } from 'src/domain/_layer/data/dto/transaction-credit.dto';

export type TransactionsTotalsResponseBody = {
  realAmount: number;
  totalCommitted: number;
  totalGain: number;
  totalWithdrawn: number;
};

type ExternalTransactionCreditsDto = {
  readonly indicatedCpf: string;
  readonly indicatedEmail: string;
  readonly indicatedName: string;
  readonly indicatedId: string;
  readonly originValue: number;
};

type ExternalTransactionDebitsWithOncWalletDto = {
  readonly originId: string;
  readonly value: number;
};

type InternalTransactionIndicate = {
  id: string;
  email: string;
  createdAt: string;
  participantId: string;
  error: boolean;
  message?: string;
};

type InternalTransactionCredit = {
  createdAt: string;
  indicatedName: string;
  originValue: number;
  value: number;
};

@Injectable()
export class IndicateApiService implements IndicateAndEarnService {
  private readonly _baseUrl: string;

  constructor(private readonly _envService: EnvService, private readonly _httpService: HttpService) {
    this._baseUrl = this._envService.get(ENV_KEYS.INDICATE_AND_EARN_BASE_URL);
  }

  async getTransactionsTotals(userId: string): Promise<IndicateAndEarnFundsDto> {
    const response$: Observable<AxiosResponse<TransactionsTotalsResponseBody>> = this._httpService.get(
      `${this._baseUrl}/participants/${encodeURIComponent(userId)}/transactions/totals`,
    );
    const response: AxiosResponse<TransactionsTotalsResponseBody> = await firstValueFrom(response$);

    return {
      realAmountInCents: response.data.realAmount,
      totalCommittedInCents: response.data.totalCommitted,
      totalGainInCents: response.data.totalGain,
      totalWithdrawnInCents: response.data.totalWithdrawn,
    };
  }

  async getTransactionsDebits(userId: string): Promise<TransactionsDebit[]> {
    const response$: Observable<AxiosResponse<TransactionsDebit[]>> = this._httpService.get(
      `${this._baseUrl}/participants/${encodeURIComponent(userId)}/transactions/debit`,
    );
    const response: AxiosResponse<TransactionsDebit[]> = await firstValueFrom(response$);
    return response.data;
  }

  async addTransactionCredit(transactionCreditsDto: TransactionCreditsDto): Promise<void> {
    const url: string = `${this._baseUrl}/transactions/credit`;
    const body: ExternalTransactionCreditsDto = this._parseToExternalDto(transactionCreditsDto);

    try {
      const response$: Observable<AxiosResponse> = this._httpService.post(url, body);
      const response: AxiosResponse = await firstValueFrom(response$);
      return response.status === 200 || response.status === 201
        ? Promise.resolve(undefined)
        : Promise.reject(UnknownDomainError.toFn()(null));
    } catch (error) {
      return Promise.reject(UnknownDomainError.toFn()(null));
    }
  }

  async getHashLink(params: HashLinkParams): Promise<string> {
    const response$: Observable<AxiosResponse<{ hashlink: string }>> = this._httpService.post(
      `${this._baseUrl}/hash-link`,
      params,
    );
    const response: AxiosResponse<{ hashlink: string }> = await firstValueFrom(response$);
    return response.data.hashlink;
  }

  async addTransactionDebitWithOncWallet(dto: TransactionDebitsWithOncWalletDto): Promise<boolean> {
    const url: string = `${this._baseUrl}/transactions/debit/onc_wallet`;
    const body: ExternalTransactionDebitsWithOncWalletDto = this._parseToExternalDtoDebit(dto);

    try {
      const response$: Observable<AxiosResponse> = this._httpService.post(url, body);
      const response: AxiosResponse = await firstValueFrom(response$);
      return response.status === 200 || response.status === 204
        ? Promise.resolve(true)
        : Promise.reject(UnknownDomainError.toFn()(false));
    } catch (error) {
      return Promise.reject(UnknownDomainError.toFn()(false));
    }
  }

  async addIndicated({ email, participantId }: Partial<IndicatedDto>): Promise<IndicatedDto> {
    const url: string = `${this._baseUrl}/indicateds`;

    try {
      const response$: Observable<AxiosResponse> = this._httpService.post(url, {
        email,
        participantId,
      });
      const response: AxiosResponse<InternalTransactionIndicate> = await firstValueFrom(response$);

      if (response.status === 200) {
        return this._parteToInternalDtoIndicated(response.data);
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  async addTransactionDebitWithdrawal(dto: TransactionDebitsWithdrawalDto): Promise<boolean> {
    const url: string = `${this._baseUrl}/transactions/debit/withdrawal`;

    try {
      const response$: Observable<AxiosResponse> = this._httpService.post(url, dto);
      const response: AxiosResponse = await firstValueFrom(response$);
      return response.status === 200 || response.status === 204
        ? Promise.resolve(true)
        : Promise.reject(UnknownDomainError.toFn()(false));
    } catch (error) {
      return Promise.reject(UnknownDomainError.toFn()(false));
    }
  }

  async getTransactionCredit(userId: string): Promise<TransactionCredit[]> {
    const response$: Observable<AxiosResponse<InternalTransactionCredit[]>> = this._httpService.get(
      `${this._baseUrl}/participants/${encodeURIComponent(userId)}/transactions/credit`,
    );
    const response: AxiosResponse<InternalTransactionCredit[]> = await firstValueFrom(response$);
    const transactionCredits: TransactionCredit[] = response.data.map(this._parteToInternalDto);
    return transactionCredits;
  }

  private _parseToExternalDto(internalDto: TransactionCreditsDto): ExternalTransactionCreditsDto {
    return {
      indicatedCpf: internalDto.indicatedCpf,
      indicatedEmail: internalDto.indicatedEmail,
      indicatedName: internalDto.indicatedName,
      indicatedId: internalDto.indicatedId,
      originValue: internalDto.originValueInCents,
    };
  }

  private _parseToExternalDtoDebit(
    internalDto: TransactionDebitsWithOncWalletDto,
  ): ExternalTransactionDebitsWithOncWalletDto {
    return {
      originId: internalDto.userId,
      value: Number(internalDto.valueInCents),
    };
  }

  private _parteToInternalDto(externalDto: InternalTransactionCredit): TransactionCredit {
    return {
      createdAt: externalDto.createdAt,
      indicatedName: externalDto.indicatedName,
      originValueInCents: externalDto.originValue,
      valueInCents: externalDto.value,
    };
  }

  private _parteToInternalDtoIndicated(externalDto: InternalTransactionIndicate): IndicatedDto {
    return {
      email: externalDto.email,
      id: externalDto.id,
      participantId: externalDto.participantId,
      cpf: null,
      name: null,
      createdAt: externalDto.createdAt,
      updatedAt: externalDto.createdAt,
      coupon: IndicatedCoupon.INDICATED,
    };
  }
}
