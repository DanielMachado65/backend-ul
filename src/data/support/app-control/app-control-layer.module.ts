import { Module, Provider } from '@nestjs/common';
import { VersionAppContolDomain } from 'src/domain/support/app-control/version-app-control.domain';
import { VersionAppContolUseCase } from './version-app-control.use-case';

const versionAppContolProvider: Provider = {
  provide: VersionAppContolDomain,
  useClass: VersionAppContolUseCase,
};

@Module({
  providers: [versionAppContolProvider],
  exports: [versionAppContolProvider],
})
export class AppControlLayerModule {}
