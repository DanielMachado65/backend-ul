import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { HttpLogReqParams } from 'src/domain/_entity/http-log.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { HttpLogDto } from 'src/domain/_layer/data/dto/http-log.dto';
import { HttpLogRepository } from 'src/domain/_layer/infrastructure/repository/http-log.repository';
import {
  AppFeatures,
  FeatureFlagService,
  RoutePolicies,
  RouteRules,
  UluruHttpLogRules,
  WhitelistedRoutes,
} from 'src/domain/_layer/infrastructure/service/feature-flag.service';
import { LogHttpRequestsDomain, LogHttpRequestsIO } from 'src/domain/support/logging/log-http-requests.domain';

@Injectable()
export class LogHttpRequestsUseCase implements LogHttpRequestsDomain {
  private static readonly DEFAULT_RULES: UluruHttpLogRules = { whitelistedRoutes: [] };

  constructor(
    private readonly _featureFlagService: FeatureFlagService,
    private readonly _httpLogRepository: HttpLogRepository,
  ) {}

  execute(dto: HttpLogDto): LogHttpRequestsIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._featureFlagService.get(AppFeatures.uluruHttpLogRules, LogHttpRequestsUseCase.DEFAULT_RULES),
    )
      .map((flag: UluruHttpLogRules) => LogHttpRequestsUseCase._filterHttpResponse(dto, flag.whitelistedRoutes))
      .map((updatedDto: HttpLogDto) => LogHttpRequestsUseCase._removeQueryFromUrl(updatedDto))
      .map((updatedDto: HttpLogDto) => LogHttpRequestsUseCase._updateCase(updatedDto))
      .map((updatedDto: HttpLogDto) => this._httpLogRepository.insert(updatedDto));
  }

  private static _removeQueryFromUrl(httpLog: HttpLogDto): HttpLogDto {
    try {
      httpLog.url = httpLog.url.split('?')[0];
    } catch (_error) {
      // Noop
    }

    return httpLog;
  }

  private static _updateCase(httpLog: HttpLogDto): HttpLogDto {
    try {
      httpLog.method = httpLog.method.toUpperCase();
      httpLog.requestHeaders = Object.keys(httpLog.requestHeaders).reduce(
        (acc: Record<string, unknown>, key: string) => {
          acc[key.toLowerCase()] = httpLog.requestHeaders[key];
          return acc;
        },
        {},
      );
      httpLog.responseHeaders = Object.keys(httpLog.responseHeaders).reduce(
        (acc: Record<string, unknown>, key: string) => {
          acc[key.toLowerCase()] = httpLog.responseHeaders[key];
          return acc;
        },
        {},
      );
    } catch (_error) {
      // Noop
    }

    return httpLog;
  }

  private static _filterHttpResponse(httpLog: HttpLogDto, rules: WhitelistedRoutes): HttpLogDto {
    for (let i: number = 0; i < rules.length; i++) {
      const rule: RouteRules = rules[i];
      const isMethodIncluded: boolean = httpLog.method.toUpperCase() === rule.method.toUpperCase();
      const isPathIncluded: boolean = httpLog.url.includes(rule.containsPath);
      const isValidActor: boolean = httpLog.actor.toLowerCase() === rule.actor.toLowerCase();
      const isValidTarget: boolean = httpLog.target.toLowerCase() === rule.target.toLowerCase();
      if (isMethodIncluded && isPathIncluded && isValidActor && isValidTarget)
        return LogHttpRequestsUseCase._applyRule(httpLog, rule);
    }

    return LogHttpRequestsUseCase._applyRule(httpLog, {
      target: httpLog.target,
      actor: httpLog.actor,
      method: httpLog.method,
      containsPath: httpLog.url,
      includeQueryParams: false,
      includeReqBody: false,
      includeResBody: false,
    });
  }

  private static _applyRule(httpLog: HttpLogDto, rule: RouteRules): HttpLogDto {
    const includeResBody: RoutePolicies = LogHttpRequestsUseCase._addMetaIncludes(httpLog, rule.includeResBody);

    return {
      ...httpLog,
      requestParams: (rule.includeQueryParams || rule.includeReqBody
        ? {
            queryParams: LogHttpRequestsUseCase._applyPolicy(
              (httpLog.requestParams as HttpLogReqParams)?.queryParams,
              rule.includeQueryParams,
            ),
            body: LogHttpRequestsUseCase._applyPolicy(
              (httpLog.requestParams as HttpLogReqParams)?.body,
              rule.includeReqBody,
            ),
          }
        : LogHttpRequestsUseCase._makeRedacted(httpLog.requestParams)) as string | HttpLogReqParams,
      responseBody: LogHttpRequestsUseCase._applyPolicy(httpLog.responseBody, includeResBody) as
        | string
        | Record<string, unknown>,
    };
  }

  private static _applyPolicy(attr: unknown, policy: unknown): unknown {
    const isPolicyBool: boolean = typeof policy === 'boolean';
    const isEnableBool: boolean = policy && isPolicyBool;
    if (isEnableBool) return attr;

    const isAttrObj: boolean = typeof attr === 'object' && !Array.isArray(attr);
    const isPolicyObj: boolean = typeof policy === 'object';
    const isEnableObj: boolean = attr && isAttrObj && policy && isPolicyObj;
    if (isEnableObj) {
      const newAttr: Record<string, unknown> = Object.keys(attr).reduce((acc: Record<string, unknown>, key: string) => {
        if (policy.hasOwnProperty(key)) acc[key] = LogHttpRequestsUseCase._applyPolicy(attr[key], policy[key]);
        else acc[key] = LogHttpRequestsUseCase._makeRedacted(attr[key]);

        return acc;
      }, {});

      return Object.keys(newAttr).length > 0 ? newAttr : LogHttpRequestsUseCase._makeRedacted(attr);
    }

    return LogHttpRequestsUseCase._makeRedacted(attr);
  }

  private static _addMetaIncludes(httpLog: HttpLogDto, includeResBody: RoutePolicies): RoutePolicies {
    const isError: boolean =
      !httpLog.responseBody.hasOwnProperty('data') &&
      httpLog.responseBody.hasOwnProperty('requestId') &&
      httpLog.responseBody.hasOwnProperty('errorId');

    if (isError) return true;

    const isBool: boolean = typeof includeResBody === 'boolean';

    if (includeResBody && isBool) return includeResBody;
    else if (!includeResBody && isBool) return { __meta__: true };
    else if (includeResBody && typeof includeResBody === 'object' && !Array.isArray(includeResBody))
      return { __meta__: true, data: includeResBody };

    return { __meta__: true };
  }

  private static _makeRedacted(attr: unknown): string {
    const type: string = typeof attr;

    if (type === 'boolean') return '<BOOLEAN>';
    else if (type === 'number') return '<NUMBER>';
    else if (type === 'string') return '<STRING>';
    else if (type === 'bigint') return '<BIGINT>';
    else if (type === 'symbol') return '<SYMBOL>';
    else if (type === 'undefined') return '<UNDEFINED>';
    else if (type === 'function') return '<FUNCTION>';
    else if (type === 'object' && attr === null) return '<NULL>';
    else if (type === 'object' && Array.isArray(attr)) return '<ARRAY>';
    else if (type === 'object' && attr instanceof Date) return '<DATE>';
    else if (type === 'object' && attr instanceof RegExp) return '<REGEX>';

    return '<OBJECT>';
  }
}
