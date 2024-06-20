import { Module, Provider } from '@nestjs/common';
import { SyncWithExternalSubscriptionHelper } from './sync-with-external-subscription.helper';

const helpers: ReadonlyArray<Provider> = [SyncWithExternalSubscriptionHelper];

@Module({
  providers: [...helpers],
  exports: [...helpers],
})
export class SharedModule {}
