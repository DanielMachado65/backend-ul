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
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import {
  NotificationIdentifier,
  NotificationQueryCompletePayload,
} from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { BalanceRepository } from 'src/domain/_layer/infrastructure/repository/balance.repository';
import { ConsumptionStatementRepository } from 'src/domain/_layer/infrastructure/repository/consumption-statement.repository';
import { CreditQueryRepository } from 'src/domain/_layer/infrastructure/repository/credit-query.repository';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { FeatureFlagPerRequestService } from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { AppFeatures } from 'src/domain/_layer/infrastructure/service/feature-flag.service';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import {
  ResponseCreditQueryDomain,
  ResponseCreditQueryDomainErrors,
  ResponseCreditQueryIO,
} from 'src/domain/core/query/credit/response-credit-query.domain';
import { ChargebackUserDomain } from 'src/domain/support/billing/chargeback-user.domain';
import { DateTime, DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';

@Injectable()
export class ResponseCreditQueryUseCase implements ResponseCreditQueryDomain {
  private static readonly MINUTES_DELAY: number = 5;

  constructor(
    private readonly _queryRepository: QueryRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _chargebackUserDomain: ChargebackUserDomain,
    private readonly _notificationInfraService: NotificationInfrastructure,
    private readonly _featureFlagService: FeatureFlagPerRequestService,
    private readonly _queryJob: QueryJob,
    private readonly _notificationEmailService: NotificationServiceGen,
    private readonly _balanceRepository: BalanceRepository,
    private readonly _consumptionRepository: ConsumptionStatementRepository,
    private readonly _userRepository: UserRepository,
    private readonly _queryRequestService: QueryRequestService,
    private readonly _queryResponseHelper: QueryResponseHelper,
    private readonly _creditQueryRepository: CreditQueryRepository,
  ) {}

  responseQuery(queryResponse: QueryResponseDto, isSync: boolean = false): ResponseCreditQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), async () =>
      this._queryRepository.getById(queryResponse.queryRef),
    ).flatMap((queryDto: QueryDto) => this._parseQueryResponse(queryResponse, queryDto, isSync));
  }

  private _parseQueryResponse(
    queryResponseDto: QueryResponseDto,
    queryDto: QueryDto,
    isSync: boolean,
  ): EitherIO<UnknownDomainError, QueryDto> {
    const startTime: DateTime = this._dateTimeUtil.fromIso(queryDto.createdAt);
    const executionTime: number = this._dateTimeUtil.now().diff(startTime) / 1000;
    const queryId: string = queryDto.id;

    return EitherIO.from(UnknownDomainError.toFn(), () => {
      const queryResult: Partial<QueryDto> = this._queryRequestService.parseCreditQuery(queryResponseDto);
      return { ...queryResult, executionTime };
    })
      .map(async (queryResult: QueryDto) => {
        const shouldObfuscateResponse: boolean = true;
        const { failedServices, stackResult }: QueryStackResultAndFailedServices =
          await this._queryResponseHelper.createStackResultAndFailedServices(
            {
              stackResult: [],
              failedServices: [],
              ...queryResponseDto,
            },
            shouldObfuscateResponse,
          );
        return { ...queryResult, failedServices, stackResult };
      })
      .filter(QueryRequestFailError.toFn(), (queryDto: QueryDto) => queryDto.queryStatus === QueryStatus.SUCCESS)
      .map(async (queryDto: QueryDto) => {
        await this._creditQueryRepository.insertScore(queryDto.id, queryResponseDto.response);
        return await this._queryRepository.updateById(queryDto.id, queryDto);
      })
      .tap(this._sendSuccessNoficication(isSync))
      .map(this._buildResponse(queryResponseDto))
      .catch(async (error: ResponseCreditQueryDomainErrors) => {
        if (queryResponseDto.status === QueryResponseStatus.FAILED) {
          await this._chargebackUser(queryDto).safeRun();
        }

        await this._queryRepository.updateById(queryId, {
          status: QueryStatus.FAILURE,
          queryStatus: QueryStatus.FAILURE,
          executionTime,
        });

        const isEnableFeatureFlag: boolean = await this._checkNotificationStatus(queryDto.userId);
        if (isEnableFeatureFlag === true) {
          await this._sendNotificationOnQueryFail(queryDto, isSync);
        }

        return Either.left(error);
      });
  }

  private _sendSuccessNoficication(isSync: boolean) {
    return async (queryDto: QueryDto): Promise<void> => {
      const isEnableFeatureFlag: boolean = await this._checkNotificationStatus(queryDto.userId);
      if (isEnableFeatureFlag === true) {
        const queryData: NotificationQueryCompletePayload = {
          queryId: queryDto.id,
          queryCode: queryDto.queryCode,
          documentType: queryDto.documentType,
          documentQuery: queryDto.documentQuery,
          queryName: queryDto.refClass,
        };

        const delay: number = ResponseCreditQueryUseCase.MINUTES_DELAY * 60 * 1000;
        await this._queryJob.createJob(queryDto.id, queryData, { delay, removeOnComplete: true });

        if (isSync === false) {
          this._notificationInfraService.dispatch(
            NotificationIdentifier.QUERY_SUCCESS,
            [{ subscriberId: queryDto.userId }],
            queryData,
          );
        }
      }
    };
  }

  private _buildResponse(queryResponseDto: QueryResponseDto) {
    return (queryDto: QueryDto): QueryDto => {
      return {
        ...queryDto,
        responseJson: queryResponseDto.response,
      };
    };
  }

  private async _checkNotificationStatus(userId: string): Promise<boolean> {
    await this._featureFlagService.setAttributes({ userId });
    const isEnableFeatureFlag: boolean = this._featureFlagService.get(AppFeatures.notification, false);
    return isEnableFeatureFlag;
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

  private async _sendNotificationOnQueryFail(queryDto: QueryDto, isSync: boolean): Promise<void> {
    const userDto: UserDto = await this._userRepository.getById(queryDto.userId);
    const userFirstName: string = userDto.name.split(' ')[0];
    if (isSync === true) return;

    await this._notificationEmailService.dispatch(NotificationTransport.EMAIL, NotificationType.QUERY_FAIL, {
      email: userDto.email,
      name: userFirstName,
      queryName: queryDto.refClass,
    });

    this._notificationInfraService.dispatch(NotificationIdentifier.QUERY_FAIL, [{ subscriberId: queryDto.userId }], {
      documentType: queryDto.documentType,
      documentQuery: queryDto.documentQuery,
      queryName: queryDto.refClass,
    });
  }
}
