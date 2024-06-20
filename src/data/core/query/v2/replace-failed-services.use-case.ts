import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { NoServiceFoundDomainError, QueryNotExistsError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ReplacedServiceCodeto, ReplacedServiceRefDto, ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { ServiceRepository } from 'src/domain/_layer/infrastructure/repository/service.repository';
import { AutoReprocessQueryService } from 'src/domain/_layer/infrastructure/service/auto-reprocess.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import {
  ReplaceFailedServicesDomain,
  ReplaceFailedServicesIO,
} from 'src/domain/core/query/v2/replace-failed-services.domain';

@Injectable()
export class ReplaceFailedServicesUseCase implements ReplaceFailedServicesDomain {
  constructor(
    private readonly _queryRequestService: QueryRequestService,
    private readonly _queryRepository: QueryRepository,
    private readonly _serviceRepository: ServiceRepository,
    private readonly _autoReprocessQueryService: AutoReprocessQueryService,
  ) {}

  replace(queryId: string, replacedServices: ReadonlyArray<ReplacedServiceCodeto>): ReplaceFailedServicesIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._queryRepository.getById(queryId))
      .filter(QueryNotExistsError.toFn(), (queryDto: QueryDto) => !!queryDto?.id)
      .map(() =>
        replacedServices.flatMap(({ newServiceCode, serviceCode }: ReplacedServiceCodeto) => [
          Number(newServiceCode),
          Number(serviceCode),
        ]),
      )
      .map(async (servicesCodes: ReadonlyArray<number>) => {
        const services: ReadonlyArray<ServiceDto> = await this._serviceRepository.getManyByServicesCodes(servicesCodes);
        return { services, servicesCodes: [...new Set(servicesCodes)] };
      })
      .filter(
        NoServiceFoundDomainError.toFn(),
        ({
          services,
          servicesCodes,
        }: {
          readonly services: ReadonlyArray<ServiceDto>;
          readonly servicesCodes: ReadonlyArray<number>;
        }) => services?.length === servicesCodes?.length,
      )
      .tap(async () => this._autoReprocessQueryService.cancelReprocess(queryId))
      .map(async () => {
        const servicesToReplace: ReadonlyArray<ReplacedServiceRefDto> = replacedServices.map(
          ({ newServiceCode, serviceCode }: ReplacedServiceCodeto) => ({
            newServiceRef: newServiceCode?.toString(),
            serviceRef: serviceCode?.toString(),
          }),
        );
        await this._queryRequestService
          .reprocessQueryByReplacedServices({
            queryRef: queryId,
            services: servicesToReplace,
          })
          .catch(Either.left);
      });
  }
}
