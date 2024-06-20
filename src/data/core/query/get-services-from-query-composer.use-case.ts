import { Injectable } from '@nestjs/common';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import {
  GetServicesFromQueryComposerDomain,
  GetServicesFromQueryComposerIO,
} from '../../../domain/core/query/get-services-from-query-composer.domain';
import { ServiceRepository } from '../../../domain/_layer/infrastructure/repository/service.repository';
import { NoProductFoundDomainError, UnknownDomainError } from '../../../domain/_entity/result.error';
import { ServiceDto } from '../../../domain/_layer/data/dto/service.dto';

@Injectable()
export class GetServicesFromQueryComposerUseCase implements GetServicesFromQueryComposerDomain {
  constructor(private readonly _serviceRepository: ServiceRepository) {}

  getServicesFromQueryComposer(queryComposerId: string): GetServicesFromQueryComposerIO {
    return EitherIO.of(UnknownDomainError.toFn(), queryComposerId)
      .map((id: string) => this._serviceRepository.getBatchByQueryComposerId(id))
      .filter(NoProductFoundDomainError.toFn(), (servicesDto: ReadonlyArray<ServiceDto>) => servicesDto.length >= 0);
  }
}
