import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  GetCitiesFromBrazilStateDomain,
  GetCitiesFromBrazilStateIO,
} from 'src/domain/support/general/get-cities-from-brazil-state.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { LocationService } from 'src/domain/_layer/infrastructure/service/location.service';

@Injectable()
export class GetCitiesFromBrazilStateUseCase implements GetCitiesFromBrazilStateDomain {
  constructor(private readonly _locationService: LocationService) {}

  getCities(state: string): GetCitiesFromBrazilStateIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => this._locationService.getCities(state));
  }
}
