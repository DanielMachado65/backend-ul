import { Module, Provider } from '@nestjs/common';
import { GetBrazilStatesDomain } from 'src/domain/support/general/get-brazil-states.domain';
import { GetCitiesFromBrazilStateDomain } from 'src/domain/support/general/get-cities-from-brazil-state.domain';
import { GetCityFromPostalCodeBrazilDomain } from 'src/domain/support/general/get-city-from-postal-code-brazil.domain';
import { GetFeatureFlagsDomain } from '../../../domain/support/general/get-feature-flags.domain';
import { GetBrazilStatesUseCase } from './get-brazil-states.use-case';
import { GetCitiesFromBrazilStateUseCase } from './get-cities-from-brazil-state.use-case';
import { GetCityFromPostalCodeBrazilUseCase } from './get-city-from-postal-code-brazil.use-case';
import { GetFeatureFlagsUseCase } from './get-feature-flags.use-case';
import { GetUserCountDomain } from 'src/domain/support/general/get-user-count.domain';
import { GetUserCountUseCase } from './get-user-count.use-case';

// eslint-disable-next-line functional/prefer-readonly-type
const useCases: Array<Provider> = [
  { provide: GetBrazilStatesDomain, useClass: GetBrazilStatesUseCase },
  { provide: GetCitiesFromBrazilStateDomain, useClass: GetCitiesFromBrazilStateUseCase },
  { provide: GetCityFromPostalCodeBrazilDomain, useClass: GetCityFromPostalCodeBrazilUseCase },
  { provide: GetFeatureFlagsDomain, useClass: GetFeatureFlagsUseCase },
  { provide: GetUserCountDomain, useClass: GetUserCountUseCase },
];

@Module({
  imports: [],
  controllers: [],
  providers: [...useCases],
  exports: [...useCases],
})
export class GeneralDataLayerModule {}
