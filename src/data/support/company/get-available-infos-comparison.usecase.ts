import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import {
  AvailableInfosComparisonIO,
  GetAvailableInfosComparisonDomain,
} from 'src/domain/support/company/get-available-infos-comparison.domain';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryInfoRepository } from 'src/domain/_layer/infrastructure/repository/query-info.repository';

@Injectable()
export class GetAvailableInfosComparisonUseCase implements GetAvailableInfosComparisonDomain {
  constructor(private readonly _queryInfoRepository: QueryInfoRepository) {}

  getComparisons(): AvailableInfosComparisonIO {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._queryInfoRepository.getAllActive());
  }
}
