import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { QueryPostalCodeService } from 'src/domain/_layer/infrastructure/service/query-postal-code.service';
import {
  GetCityFromPostalCodeBrazilDomain,
  GetCityFromPostalCodeBrazilIO,
} from 'src/domain/support/general/get-city-from-postal-code-brazil.domain';

@Injectable()
export class GetCityFromPostalCodeBrazilUseCase implements GetCityFromPostalCodeBrazilDomain {
  constructor(private readonly _queryPostalCodeService: QueryPostalCodeService) {}

  getFromPostalCode(code: string): GetCityFromPostalCodeBrazilIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () =>
      this._queryPostalCodeService.queryPostalCode(code),
    );
  }
}
