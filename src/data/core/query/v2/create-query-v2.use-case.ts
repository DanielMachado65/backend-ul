import { Either, EitherIO, ErrorFn } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { AllQueryKeys } from 'src/domain/_entity/query-keys.entity';
import { QueryRequestService } from 'src/domain/_layer/infrastructure/service/query-request.service';
import { CreateQueryV2Domain, CreateQueryV2IO } from 'src/domain/core/query/v2/create-query-v2.domain';
import { QueryComposerEntity, QueryComposerType } from '../../../../domain/_entity/query-composer.entity';
import {
  QueryDocumentType,
  QueryEntity,
  QueryFailedService,
  QueryRules,
  QueryStackResultService,
  QueryStatus,
} from '../../../../domain/_entity/query.entity';
import {
  InvalidKeysForProductDomainError,
  NoUserFoundDomainError,
  ProviderUnavailableDomainError,
  QueryDuplicatedDomainError,
  QueryRequestFailError,
  UnknownDomainError,
} from '../../../../domain/_entity/result.error';
import { GetProviderDataDto } from '../../../../domain/_layer/data/dto/get-provider-data.dto';
import { QueryComposerDto } from '../../../../domain/_layer/data/dto/query-composer.dto';
import { QueryLogDto } from '../../../../domain/_layer/data/dto/query-log.dto';
import { QueryDto } from '../../../../domain/_layer/data/dto/query.dto';
import { ServiceDto } from '../../../../domain/_layer/data/dto/service.dto';
import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';
import { QueryLogRepository } from '../../../../domain/_layer/infrastructure/repository/query-log.repository';
import { QueryRepository } from '../../../../domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from '../../../../domain/_layer/infrastructure/repository/user.repository';
import { GetQueryComposerDomain } from '../../../../domain/core/query/get-query-composer.domain';
import { DateTime, DateTimeUtil } from '../../../../infrastructure/util/date-time-util.service';

export type CreateQueryProviderResultData = {
  readonly result: QueryStackResultService;
  readonly failure: Partial<QueryFailedService>;
};

export type CreateQueryProviderData = {
  readonly stackResult: ReadonlyArray<QueryStackResultService>;
  readonly failedServices: ReadonlyArray<Partial<QueryFailedService>>;
};

type NewQueryResult = {
  readonly queryDto: QueryDto;
  readonly queryLogDto: QueryLogDto;
  readonly queryComposerDto: QueryComposerDto;
};

type ProcessQueryInput = {
  readonly queryDto: QueryDto;
  readonly queryComposerDto: QueryComposerDto;
  readonly keys: AllQueryKeys;
  readonly user: UserDto;
};

export type CreateQueryData = {
  readonly queryDto: QueryDto;
  readonly queryLogDto: QueryLogDto;
  readonly queryComposerDto: QueryComposerDto;
  readonly servicesDto: ReadonlyArray<ServiceDto>;
  readonly providerDto: GetProviderDataDto;
  readonly stackResult: ReadonlyArray<QueryStackResultService>;
  readonly failedServices: ReadonlyArray<Partial<QueryFailedService>>;
};

type QueryDuplicatedIO = EitherIO<UnknownDomainError | QueryDuplicatedDomainError, QueryComposerEntity>;

type DocumentQuery = { readonly documentQuery: string; readonly documentType: QueryDocumentType };
@Injectable()
export class CreateQueryV2UseCase implements CreateQueryV2Domain {
  private static readonly USERS_WITH_RULES: ReadonlyArray<string> = [
    '6006d621f323ba0011667c29',
    '661d9b23d8c81f23fb0208bf',
  ];

  private readonly _defaultCep: string = '01015100';

  constructor(
    private readonly _getQueryComposerDomain: GetQueryComposerDomain,
    private readonly _queryRepository: QueryRepository,
    private readonly _queryLogRepository: QueryLogRepository,
    private readonly _userRepository: UserRepository,
    private readonly _dateTimeUtil: DateTimeUtil,
    private readonly _queryRequestService: QueryRequestService,
  ) {}

  private static _checkIfIsValidUser(user: UserDto): boolean {
    return typeof user === 'object' && user !== null && user.status;
  }

  private async _getDuplicatedQuery(
    userId: string,
    queryCode: number,
    keys: AllQueryKeys,
    mayDuplicate: boolean,
    queryComposerDto: QueryComposerDto,
  ): Promise<QueryDto | null> {
    if (mayDuplicate) return null;
    let finishedFromDate: DateTime = null;
    if (queryComposerDto.queryType === QueryComposerType.CREDIT) {
      finishedFromDate = this._dateTimeUtil.now().subtract(1, 'hour');
    } else {
      finishedFromDate = this._dateTimeUtil.now().subtract(1, 'day');
    }
    const last5Minutes: DateTime = this._dateTimeUtil.now().subtract(5, 'minute');
    return this._queryRepository.getDuplicatedQuery(userId, queryCode, keys, finishedFromDate, last5Minutes);
  }

  private _newQuery(
    userId: string,
    queryKeys: AllQueryKeys,
  ): (queryComposerDto: QueryComposerDto) => Promise<NewQueryResult> {
    return async (queryComposerDto: QueryComposerDto): Promise<NewQueryResult> => {
      const { documentQuery, documentType }: DocumentQuery = this._getDocument(queryKeys);
      const hasRule: boolean = CreateQueryV2UseCase.USERS_WITH_RULES.includes(userId);

      const preQueryDto: QueryDto = await this._queryRepository.insert({
        userId,
        documentQuery,
        documentType,
        queryKeys,
        queryCode: queryComposerDto.queryCode,
        refClass: queryComposerDto.name,
        version: 2,
        rules: hasRule ? [QueryRules.HIDE_ADS] : [],
      });

      const queryLogDto: QueryLogDto = await this._queryLogRepository.insert({
        queryId: preQueryDto.id,
        userId: userId,
      });

      const queryDto: QueryDto = await this._queryRepository.updateById(preQueryDto.id, {
        ...preQueryDto,
        logId: queryLogDto.id,
      });

      return { queryDto, queryLogDto, queryComposerDto };
    };
  }

  private _getDocument(queryKeys: AllQueryKeys): DocumentQuery {
    if ('plate' in queryKeys && !!queryKeys.plate) {
      return { documentQuery: queryKeys.plate, documentType: QueryDocumentType.PLATE };
    } else if ('chassis' in queryKeys && !!queryKeys.chassis) {
      return { documentQuery: queryKeys.chassis, documentType: QueryDocumentType.CHASSIS };
    } else if ('engine' in queryKeys && !!queryKeys.engine) {
      return { documentQuery: queryKeys.engine, documentType: QueryDocumentType.ENGINE };
    } else if ('cpf' in queryKeys && !!queryKeys.cpf) {
      return { documentQuery: queryKeys.cpf, documentType: QueryDocumentType.CPF };
    } else if ('cnpj' in queryKeys && !!queryKeys.cnpj) {
      return { documentQuery: queryKeys.cnpj, documentType: QueryDocumentType.CNPJ };
    }

    return null;
  }

  private _processQuery({
    queryDto,
    queryComposerDto,
    keys,
    user,
  }: ProcessQueryInput): EitherIO<InvalidKeysForProductDomainError | ProviderUnavailableDomainError, QueryEntity> {
    const startTime: DateTime = this._dateTimeUtil.fromIso(queryDto.createdAt);
    const executionTime: number = this._dateTimeUtil.now().diff(startTime) / 1000;

    return EitherIO.from(UnknownDomainError.toFn(), async () => {
      await this._queryRequestService.requestQuery({
        queryRef: queryDto.id,
        keys,
        templateQueryRef: queryComposerDto.queryCode.toString(),
        support: {
          userEmail: user.email,
          userName: user.name,
        },
      });
      return queryDto;
    }).catch(async (error: QueryRequestFailError) => {
      await this._queryRepository.updateById(queryDto.id, {
        status: QueryStatus.FAILURE,
        queryStatus: QueryStatus.FAILURE,
        executionTime,
      });

      return Either.left(error);
    });
  }

  private _checkIfDuplicatedQuery(
    userId: string,
    queryCode: number,
    keys: AllQueryKeys,
    mayDuplicate: boolean,
  ): (queryComposerDto: QueryComposerDto) => QueryDuplicatedIO {
    return (queryComposerDto: QueryComposerDto): QueryDuplicatedIO => {
      return EitherIO.from(UnknownDomainError.toFn(), () =>
        this._getDuplicatedQuery(userId, queryCode, keys, mayDuplicate, queryComposerDto),
      ).flatMap((maybeQuery: QueryDto | null, errorFn: ErrorFn<UnknownDomainError>) => {
        return maybeQuery
          ? EitherIO.raise(
              QueryDuplicatedDomainError.toFn({
                queryId: maybeQuery.id,
                code: maybeQuery.queryCode,
                name: maybeQuery.refClass,
                createdAt: maybeQuery.createdAt,
              }),
            )
          : EitherIO.of(errorFn, queryComposerDto);
      });
    };
  }

  private _enrichQueryKeys(user: UserDto, queryKeys: AllQueryKeys): AllQueryKeys {
    const zipCode: string = user?.address?.zipCode || this._defaultCep;
    return { zipCode, ...queryKeys };
  }

  private _fromUser(userId: string): EitherIO<UnknownDomainError | NoUserFoundDomainError, UserDto> {
    return EitherIO.from(UnknownDomainError.toFn(), () => this._userRepository.getById(userId)).filter(
      NoUserFoundDomainError.toFn(),
      CreateQueryV2UseCase._checkIfIsValidUser,
    );
  }

  createQuery(userId: string, queryCode: number, queryKeys: AllQueryKeys, mayDuplicate: boolean): CreateQueryV2IO {
    return this._fromUser(userId)
      .map((user: UserDto) => {
        const nextQueryKeys: AllQueryKeys = this._enrichQueryKeys(user, queryKeys);
        return {
          user,
          nextQueryKeys,
        };
      })
      .flatMap(({ nextQueryKeys, user }: { readonly nextQueryKeys: AllQueryKeys; readonly user: UserDto }) => {
        return this._getQueryComposerDomain
          .getQueryComposer(userId, queryCode)
          .flatMap(this._checkIfDuplicatedQuery(userId, queryCode, nextQueryKeys, mayDuplicate))
          .map(this._newQuery(userId, nextQueryKeys))
          .flatMap(({ queryDto, queryComposerDto }: NewQueryResult) =>
            this._processQuery({ queryComposerDto, queryDto, keys: nextQueryKeys, user }),
          );
      });
  }
}
