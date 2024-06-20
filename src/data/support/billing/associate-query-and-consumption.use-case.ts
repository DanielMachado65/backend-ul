import { Injectable } from '@nestjs/common';
import {
  AssociateQueryAndConsumptionDomain,
  AssociateQueryAndConsumptionIO,
} from '../../../domain/support/billing/associate-query-and-consumption.domain';
import { ConsumptionStatementRepository } from '../../../domain/_layer/infrastructure/repository/consumption-statement.repository';
import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { NoConsumptionFoundDomainError, UnknownDomainError } from '../../../domain/_entity/result.error';
import { ConsumptionStatementDto } from '../../../domain/_layer/data/dto/consumption-statement.dto';

@Injectable()
export class AssociateQueryAndConsumptionUseCase implements AssociateQueryAndConsumptionDomain {
  constructor(private readonly _consumptionRepository: ConsumptionStatementRepository) {}

  associateQueryAndConsumption(consumptionId: string, queryId: string): AssociateQueryAndConsumptionIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._consumptionRepository.getById(consumptionId))
      .filter(NoConsumptionFoundDomainError.toFn(), (consumptionDto: ConsumptionStatementDto) => !!consumptionDto)
      .map((consumptionDto: ConsumptionStatementDto) => {
        return this._consumptionRepository.updateById(consumptionId, { ...consumptionDto, queryId });
      });
  }
}
