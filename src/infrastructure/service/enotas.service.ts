import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Span } from '@alissonfpmorais/rastru';
import * as ENotas from '@diegomoura637/enotas-service';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Observable, firstValueFrom } from 'rxjs';
import { InvalidObjectDomainError, UnknownDomainError } from '../../domain/_entity/result.error';
import { PaymentDto } from '../../domain/_layer/data/dto/payment.dto';
import { UserDto } from '../../domain/_layer/data/dto/user.dto';
import { NFe, NfeService } from '../../domain/_layer/infrastructure/service/nfe.service';
import { ENV_KEYS, EnvService, EnvVariableName } from '../framework/env.service';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { Currency, CurrencyUtil } from '../util/currency.util';

/** DTOs */

class ENotasResponseDto {
  @IsString()
  @IsNotEmpty()
  nfeId: string;
}

type GenInvoiceResult = { readonly data: Record<string, unknown> };

type Credentials = {
  readonly apiKey: string;
  readonly providerId: string;
};

@Injectable()
export class ENotasService implements NfeService {
  private readonly _emissionAmbient: string;
  private readonly _baseUrl: string;
  private readonly _providers: ReadonlyMap<string, Credentials>;

  constructor(
    private readonly _envService: EnvService,
    private readonly _httpService: HttpService,
    private readonly _classValidatorUtil: ClassValidatorUtil,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    this._emissionAmbient = this._envService.isDevEnv() ? 'Homologacao' : 'Producao';
    this._baseUrl = _envService.get(ENV_KEYS.ENOTAS_URL_BASE);

    // eslint-disable-next-line functional/prefer-readonly-type
    const providers: Map<string, Credentials> = new Map();

    for (let i: number = 1; ; i++) {
      const prefix: string = 'PROV' + i + '_';
      const cnpj: string = _envService.get(`CNPJ${i}` as EnvVariableName);
      if (typeof cnpj === 'undefined') {
        this._providers = providers;
        break;
      }

      const apiKey: string = _envService.get(`${prefix}ENOTAS_API_KEY` as EnvVariableName);
      const providerId: string = _envService.get(`${prefix}ENOTAS_PROVIDER_ID` as EnvVariableName);
      providers.set(cnpj, { apiKey, providerId });
    }
  }

  private _makeNfePayload(description: string, paymentDto: PaymentDto, userDto: UserDto): ENotas.NFe {
    const totalValue: number = this._currencyUtil
      .numToCurrency(paymentDto.totalPaidInCents, Currency.CENTS_PRECISION)
      .toFloat();
    return new ENotas.NFe()
      .setClientName(userDto.name)
      .setClientEmail(userDto.email)
      .setClientCpfCnpj(userDto.cpf)
      .setClientAddressUf(userDto.address.state)
      .setClientAddressCity(userDto.address.city)
      .setClientAddressPlace(userDto.address.street)
      .setClientAddressNumber(userDto.address.number)
      .setClientAddressComplement(userDto.address.complement)
      .setClientAddressNeighborhood(userDto.address.neighborhood)
      .setClientAddressCep(userDto.address.zipCode)
      .setNfe_external_id(paymentDto.id)
      .setDescription(description)
      .setTotalValue(totalValue)
      .setPersonType('F')
      .setClientAddressCountry('Brasil')
      .setCofins(0)
      .setCsll(0)
      .setInss(0)
      .setIr(0)
      .setPis(0)
      .setIisAliquota(0)
      .setIssRetido(false)
      .setSendByEmail(false)
      .setEmissionAmbient(this._emissionAmbient)
      .getDtoToCreateNfeOnGateway();
  }

  @Span('payment-v3')
  generateNfe(description: string, paymentDto: PaymentDto, userDto: UserDto): EitherIO<InvalidObjectDomainError, NFe> {
    return EitherIO.of(UnknownDomainError.toFn(), this._makeNfePayload(description, paymentDto, userDto))
      .map((nfe: ENotas.NFe) => this._generateInvoice(nfe, paymentDto.cnpj))
      .flatMap((result: GenInvoiceResult) => this._classValidatorUtil.validateAndResult(result.data, ENotasResponseDto))
      .map((response: ENotasResponseDto) => response.nfeId)
      .map(async (nfeExternalId: string) => {
        for (let i: number = 15; i > 0; i--) {
          try {
            const response: NFe = await this.fetchInvoice(nfeExternalId, paymentDto.cnpj);
            if (response.number && response.confirmationNumber) return response;
            await new Promise((re: (arg: unknown) => void) => setTimeout(re, 2_000));
          } catch {
            // noop
          }
        }

        return {
          number: null,
          externalId: null,
          confirmationNumber: nfeExternalId,
        };
      });
  }

  private async _generateInvoice(nfe: ENotas.NFe, cnpj: string): Promise<GenInvoiceResult> {
    ENotas.NFe.validateNfe(nfe);
    const credentials: Credentials = this._getCrendetials(cnpj);
    const url: string = this._baseUrl + 'empresas/' + credentials.providerId + '/nfes';
    const response$: Observable<GenInvoiceResult> = this._httpService.post(
      url,
      nfe,
      ENotasService._getHeaders(credentials.apiKey),
    );
    return await firstValueFrom(response$);
  }

  async fetchInvoice(externalNfeId: string, cnpj: string): Promise<NFe> {
    const credentials: Credentials = this._getCrendetials(cnpj);
    const url: string = `${this._baseUrl}/empresas/${encodeURIComponent(
      credentials.providerId,
    )}/nfes/${encodeURIComponent(externalNfeId)}`;
    const response$: Observable<GenInvoiceResult> = this._httpService.get(
      url,
      ENotasService._getHeaders(credentials.apiKey),
    );
    // eslint-disable-next-line @typescript-eslint/typedef
    const http = await firstValueFrom(response$);
    return {
      number: (http.data.numero || null) as string,
      externalId: (http.data.id || externalNfeId) as string,
      confirmationNumber: (http.data.codigoVerificacao || null) as string,
    };
  }

  private _getCrendetials(cnpj: string): Credentials {
    return this._providers.get(cnpj) || { apiKey: '', providerId: '' };
  }

  private static _getHeaders(apiKey: string): Record<string, unknown> {
    return {
      headers: {
        'content-type': 'application/json',
        Authorization: `basic ${apiKey}`,
      },
    };
  }
}
