import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { QueryDuplicatedDomainError, UnknownDomainError } from '../../../_entity/result.error';
import { ChargeUserDomainErrors } from '../../../support/billing/charge-user-for-query.domain';
import { ChargebackUserDomainErrors } from '../../../support/billing/chargeback-user.domain';
import { GetQueryPriceDomainErrors } from '../../../support/billing/get-query-price.domain';
import { GetUserCurrentBalanceDomainErrors } from '../../../support/billing/get-user-current-balance.domain';
import { GetUserDomainErrors } from '../../user/get-user.domain';
import { CreateQueryDomainErrors } from '../create-query.domain';
import { GetAlreadyDoneQueryDomainErrors } from '../get-already-done-query.domain';
import { GetQueryComposerDomainErrors } from '../get-query-composer.domain';
import { GetServicesFromQueryComposerDomainErrors } from '../get-services-from-query-composer.domain';

export type ResponseCreditQueryDomainErrors =
  | UnknownDomainError
  | ChargeUserDomainErrors
  | ChargebackUserDomainErrors
  | GetQueryPriceDomainErrors
  | GetUserCurrentBalanceDomainErrors
  | CreateQueryDomainErrors
  | GetQueryComposerDomainErrors
  | GetServicesFromQueryComposerDomainErrors
  | GetAlreadyDoneQueryDomainErrors
  | GetUserDomainErrors
  | QueryDuplicatedDomainError;

export type ResponseCreditQueryResult = Either<ResponseCreditQueryDomainErrors, void>;

export type ResponseCreditQueryIO = EitherIO<ResponseCreditQueryDomainErrors, QueryDto>;

export abstract class ResponseCreditQueryDomain {
  static readonly QUERY_CODE: number = 27;

  readonly responseQuery: (queryResponse: QueryResponseDto, isSync?: boolean) => ResponseCreditQueryIO;
}
