import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { GetBrazilStatesDomain, GetBrazilStatesIO } from 'src/domain/support/general/get-brazil-states.domain';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { LocationService } from 'src/domain/_layer/infrastructure/service/location.service';

@Injectable()
export class GetBrazilStatesUseCase implements GetBrazilStatesDomain {
  constructor(private readonly _locationService: LocationService) {}

  getStates(): GetBrazilStatesIO {
    return EitherIO.from(ProviderUnavailableDomainError.toFn(), () => this._locationService.getStates());
  }
}
