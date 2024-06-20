import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import { GetPlansIO } from 'src/domain/support/billing/get-plans.domain';

@Injectable()
export class GetPlansUseCase {
  constructor(private readonly _priceTableRepository: PriceTableRepository) {}

  getPlans(): GetPlansIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._priceTableRepository.getPlans());
  }
}
