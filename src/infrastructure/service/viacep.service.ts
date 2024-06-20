import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import { Equals, IsString } from 'class-validator';
import { Observable, firstValueFrom } from 'rxjs';
import { PostalCodeInfo, PostalCodeInfoOrigin } from 'src/domain/_layer/data/dto/postal-code-info.dto';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import { ENV_KEYS, EnvService } from '../framework/env.service';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { CacheHttpService } from './cache-http.service';

type HttpResponseType = AxiosResponse<Record<string, unknown>>;

class PostalCodeInfoViaCep {
  @IsString()
  @ApiProperty()
  cep: string;

  @IsString()
  @ApiProperty()
  logradouro: string;

  @IsString()
  @ApiProperty()
  bairro: string;

  @IsString()
  @ApiProperty()
  localidade: string;

  @IsString()
  @ApiProperty()
  uf: string;

  @IsString()
  @ApiProperty()
  complemento: string;

  @IsString()
  @ApiProperty()
  ddd: string;
}

class PostalCodeNotFoundInfoViaCep {
  @IsString()
  @Equals('true')
  erro: true;
}

@Injectable()
export class ViaCepService implements QueryPostalCodeService {
  private readonly _baseUrl: string;

  constructor(
    private readonly _httpService: CacheHttpService,
    private readonly _validatorUtil: ClassValidatorUtil,
    private readonly _envService: EnvService,
  ) {
    this._baseUrl = _envService.get(ENV_KEYS.VIACEP_BASE_URL);
  }

  async queryPostalCode(onlyNumberCode: string): Promise<PostalCodeInfo> {
    try {
      const url: string = this._buildUrl(onlyNumberCode);

      const httpResponse: Observable<HttpResponseType> = this._httpService.get(url);
      const response: HttpResponseType = await firstValueFrom(httpResponse);

      // status still is 200 even when not found
      const didNotFound: boolean = await this._validatorUtil.validateSync(response.data, PostalCodeNotFoundInfoViaCep);

      if (didNotFound) return null;

      return this._validatorUtil
        .validateAndResult(response.data, PostalCodeInfoViaCep)
        .map((data: PostalCodeInfoViaCep) => this._mapToGenericPostalCodeInfo(data))
        .unsafeRun();
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  private _buildUrl(onlyNumberCode: string): string {
    return `${this._baseUrl}/ws/${onlyNumberCode}/json/`;
  }

  private _mapToGenericPostalCodeInfo(info: PostalCodeInfoViaCep): PostalCodeInfo {
    const zipCode: unknown = info.cep;
    return {
      postalCode: typeof zipCode === 'string' ? zipCode.replace('-', '') : null,
      street: info.logradouro !== '' ? info.logradouro : null,
      city: info.localidade,
      uf: info.uf,
      neighborhood: info.bairro !== '' ? info.bairro : null,
      complement: info.complemento ? info.complemento : null,
      ddd: info.ddd ? info.ddd : null,
      __origin__: PostalCodeInfoOrigin.VIACEP,
    };
  }
}
