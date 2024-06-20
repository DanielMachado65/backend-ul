import { firstValueFrom, Observable } from 'rxjs';
import { PostalCodeInfo, PostalCodeInfoOrigin } from 'src/domain/_layer/data/dto/postal-code-info.dto';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import { AxiosResponse } from 'axios';
import { Injectable } from '@nestjs/common';
import { ClassValidatorUtil } from '../util/class-validator.util';
import { EnvService, ENV_KEYS } from '../framework/env.service';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CacheHttpService } from './cache-http.service';

type HttpResponseType = AxiosResponse<Record<string, unknown>>;

class PostalCodeInfoBrasilApi {
  @IsString()
  @ApiProperty()
  cep: string;

  @IsString()
  @ApiProperty()
  state: string;

  @IsString()
  @ApiProperty()
  city: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  street?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty()
  location?: Record<string, unknown>;
}

@Injectable()
export class BrasilApiService implements QueryPostalCodeService {
  private readonly _baseUrl: string;

  constructor(
    private readonly _httpService: CacheHttpService,
    private readonly _validatorUtil: ClassValidatorUtil,
    private readonly _envService: EnvService,
  ) {
    this._baseUrl = _envService.get(ENV_KEYS.BRASIL_API_BASE_URL);
  }

  async queryPostalCode(onlyNumberCode: string): Promise<PostalCodeInfo> {
    try {
      const url: string = this._buildUrl(onlyNumberCode);

      const httpResponse: Observable<HttpResponseType> = this._httpService.get(url);
      const response: HttpResponseType = await firstValueFrom(httpResponse);

      const didNotFound: boolean = response.status === 404;

      if (didNotFound) return null;

      return this._validatorUtil
        .validateAndResult(response.data, PostalCodeInfoBrasilApi)
        .map((data: PostalCodeInfoBrasilApi) => this._mapToGenericPostalCodeInfo(data))
        .unsafeRun();
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  private _buildUrl(onlyNumberCode: string): string {
    return `${this._baseUrl}/api/cep/v2/${onlyNumberCode}`;
  }

  private _mapToGenericPostalCodeInfo(info: PostalCodeInfoBrasilApi): PostalCodeInfo {
    return {
      postalCode: info.cep,
      street: info.street ? info.street : null,
      city: info.city,
      uf: info.state,
      neighborhood: info.neighborhood ? info.neighborhood : null,
      complement: null,
      ddd: null,
      __origin__: PostalCodeInfoOrigin.BRASIL_API,
    };
  }
}
