import { Injectable } from '@nestjs/common';

import { QueryStatus } from 'src/domain/_entity/query.entity';
import { CreditScoreDto } from 'src/domain/_layer/data/dto/credit-score.dto';
import { QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import {
  GetAlreadyDoneQueryV2Domain,
  GetAlreadyDoneQueryV2IO,
} from 'src/domain/core/query/v2/get-already-done-query-v2.domain';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';
import { ClientType } from '../../../../domain/_entity/client.entity';
import { QueryRepresentationEntity } from '../../../../domain/_entity/query-representation.entity';
import { QueryDto } from '../../../../domain/_layer/data/dto/query.dto';
import { QueryPopUpHelper } from '../query-popup.helper';
import { QueryHelper } from '../query.helper';

@Injectable()
export class GetAlreadyDoneQueryV2UseCase implements GetAlreadyDoneQueryV2Domain {
  constructor(
    private readonly _queryHelper: QueryHelper,
    private readonly _queryPopUpHelper: QueryPopUpHelper,
    private readonly _queryJob: QueryJob,
    private readonly _creditQueryRepository: CreditQueryRepository,
    private readonly _queryRepository: QueryRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {}

  getAlreadyDoneQuery(queryId: string, clientType: ClientType): GetAlreadyDoneQueryV2IO {
    return this._queryHelper
      .getQuery(queryId)
      .tap(this._removeNotificationJob())
      .map(this._getCreditOrVehicleQuery())
      .map(this._updateCreditStatusQuery())
      .flatMap((queryDto: QueryDto) => this._queryHelper.getQueryRepresentationV2(queryDto, clientType))
      .flatMap((queryRepresentation: QueryRepresentationEntity) => {
        return this._queryPopUpHelper.makePopUpQueryRepresentation(queryRepresentation, clientType);
      });
  }

  private _removeNotificationJob() {
    return (queryDto: QueryDto): void => {
      if (queryDto.queryStatus === QueryStatus.SUCCESS) {
        this._queryJob.removeJob(queryDto.id);
      }
    };
  }

  private _getCreditOrVehicleQuery() {
    return async (queryDto: QueryDto): Promise<QueryDto> => {
      if (queryDto.documentType === 'CPF' || queryDto.documentType === 'CNPJ') {
        const score: CreditScoreDto = await this._creditQueryRepository.getScore(queryDto.id);
        return { ...queryDto, responseJson: { ...score } };
      }

      return queryDto;
    };
  }

  private _updateCreditStatusQuery() {
    return async (queryDto: QueryDto): Promise<QueryDto> => {
      if (queryDto.documentType === 'CPF' || queryDto.documentType === 'CNPJ') {
        if (queryDto.queryStatus === QueryStatus.EXPIRED) return queryDto;

        const createdAt: Date = new Date(queryDto.createdAt);
        const expireDate: Date = this._dateTimeUtil.fromDate(createdAt).add(1, 'hour').toDate();
        const dateNow: Date = this._dateTimeUtil.now().toDate();
        if (expireDate >= dateNow) return queryDto;
        return await this._queryRepository.updateById(queryDto.id, { queryStatus: QueryStatus.EXPIRED });
      }

      return queryDto;
    };
  }
}
