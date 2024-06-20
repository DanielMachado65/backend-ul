import { Global, Module, Provider } from '@nestjs/common';

import { QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import { BullAdapterMock } from 'src/infrastructure/job/test/bull-adapter.mock';

const providers: ReadonlyArray<Provider> = [
  {
    provide: QueryJob,
    useClass: BullAdapterMock,
  },
];

@Global()
@Module({
  imports: [],
  providers: [...providers],
  exports: [...providers],
})
export class JobMockModule {}
