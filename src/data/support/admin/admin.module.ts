import { Module, Provider } from '@nestjs/common';
import { ListMyCarsPaginatedUseCase } from './list-my-cars-paginated.use-case';
import { ListMyCarsPaginatedDomain } from 'src/domain/support/admin/list-my-cars-paginated.domain';

const usecases: Provider[] = [{ provide: ListMyCarsPaginatedDomain, useClass: ListMyCarsPaginatedUseCase }];

@Module({
  providers: [...usecases],
  exports: [...usecases],
})
export class AdminDataModule {}
