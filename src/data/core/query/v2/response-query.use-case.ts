import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { QueryResponseHelper, QueryStackResultAndFailedServices } from 'src/data/core/query/v2/query-response.helper';
import { QueryResponseStatus } from 'src/domain/_entity/query-response.entity';
import { QueryStatus } from 'src/domain/_entity/query.entity';
import { InvalidBillingError, QueryRequestFailError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { BalanceDto } from 'src/domain/_layer/data/dto/balance.dto';
import { ConsumptionStatementDto } from 'src/domain/_layer/data/dto/consumption-statement.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { BalanceRepository } from 'src/domain/_layer/infrastructure/repository/balance.repository';
import { ConsumptionStatementRepository } from 'src/domain/_layer/infrastructure/repository/consumption-statement.repository';
import { QueryLogRepository } from 'src/domain/_layer/infrastructure/repository/query-log.repository';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { EventEmitterService } from 'src/domain/_layer/infrastructure/service/event/event.service';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import {
  ResponseQueryDomain,
  ResponseQueryDomainErrors,
  ResponseQueryIO,
} from 'src/domain/core/query/v2/response-query.domain';
import { ChargebackUserDomain } from 'src/domain/support/billing/chargeback-user.domain';
import { AppEventDispatcher } from 'src/infrastructure/decorators/events.decorator';

@Injectable()
export class ResponseQueryUseCase implements ResponseQueryDomain {
  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _queryLogRepository: QueryLogRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _consumptionRepository: ConsumptionStatementRepository,
    private readonly _chargebackUserDomain: ChargebackUserDomain,
    private readonly _queryResponseHelper: QueryResponseHelper,
    private readonly _balanceRepository: BalanceRepository,
    @AppEventDispatcher() private readonly _eventEmitterService: EventEmitterService,
  ) {}

  responseQuery(queryResponse: QueryResponseDto): ResponseQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () =>
      this._queryRepository.getById(queryResponse.queryRef),
    ).flatMap((queryDto: QueryDto) => this._parseQueryResponse(queryResponse, queryDto));
  }

  private _parseQueryResponse(
    queryResponseDto: QueryResponseDto,
    queryDto: QueryDto,
  ): EitherIO<UnknownDomainError, void> {
    const queryId: string = queryDto.id;

    return EitherIO.from(UnknownDomainError.toFn(), () => {
      return this._queryRequestService.parseQueryResponse(queryResponseDto);
    })
      .map(async (queryResult: QueryDto) => {
        const { failedServices, stackResult }: QueryStackResultAndFailedServices =
          await this._queryResponseHelper.createStackResultAndFailedServices(queryResponseDto);
        return { ...queryResult, failedServices, stackResult };
      })
      .filter(
        QueryRequestFailError.toFn(),
        (queryDto: QueryDto) =>
          queryDto.queryStatus === QueryStatus.SUCCESS || queryDto.queryStatus === QueryStatus.PARTIAL,
      )
      .map(async (queryDto: QueryDto) => await this._queryRepository.updateById(queryDto.id, queryDto))
      .map(async (queryDto: QueryDto) => {
        this._eventEmitterService.dispatchQuerySucceeded({
          queryId: queryDto.id,
          userId: queryDto.userId,
          keys: queryDto.queryKeys,
          queryDto: queryDto,
        });
      })
      .catch(async (error: ResponseQueryDomainErrors) => {
        if (queryResponseDto.status === QueryResponseStatus.FAILED) {
          await this._chargebackUser(queryDto).safeRun();
        }

        await this._queryLogRepository.updateByQueryId(queryId, {
          status: false,
          errorMessage: ResponseQueryUseCase._prettifyErrorMsg(error),
        });

        await this._queryRepository.updateById(queryId, {
          status: QueryStatus.FAILURE,
          queryStatus: QueryStatus.FAILURE,
          executionTime: queryResponseDto.executionTime,
        });

        this._eventEmitterService.dispatchQueryFailure({
          queryDto: { ...queryDto, status: QueryStatus.FAILURE, queryStatus: QueryStatus.FAILURE },
        });

        return Either.left(error);
      });
  }

  private _chargebackUser(queryDto: QueryDto): EitherIO<UnknownDomainError, void> {
    return EitherIO.from(
      UnknownDomainError.toFn(),
      async () => await this._consumptionRepository.getByQueryId(queryDto.id),
    )
      .filter(InvalidBillingError.toFn(), async ({ billingId }: ConsumptionStatementDto) => !!billingId)
      .map(async (consumptionDto: ConsumptionStatementDto) => {
        const balance: BalanceDto = await this._balanceRepository.getByConsumptionItemId(consumptionDto.id);
        await this._chargebackUserDomain.chargebackUser(balance.id).safeRun();
      });
  }

  private static _prettifyErrorMsg(error: ResponseQueryDomainErrors): string {
    try {
      type InternalDetails = {
        readonly name: string;
        readonly message: string;
        readonly stackTrace: string;
      };

      const internalDetails: InternalDetails = error.internalDetails as unknown as InternalDetails;

      const tag: string = error.tag;
      const description: string = error.description;
      const entrypoint: string =
        internalDetails?.stackTrace
          ?.split(/\r?\n|\r|\n/g)
          ?.filter((text: string) => typeof text === 'string')
          ?.map((text: string) => text.trim())
          ?.find((text: string) => text.startsWith('at')) ||
        internalDetails?.stackTrace ||
        'unknown';

      return JSON.stringify({ tag, description, entrypoint });
    } catch (_error) {
      return 'unknown error';
    }
  }
}
