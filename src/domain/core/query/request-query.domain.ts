import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryRepresentationWithPopUpEntity } from 'src/domain/_entity/query-representation.entity';
import { ClientType } from '../../_entity/client.entity';
import { QueryKeysEntity } from '../../_entity/query-keys.entity';
import { QueryDuplicatedDomainError, UnknownDomainError } from '../../_entity/result.error';
import { ChargeUserDomainErrors } from '../../support/billing/charge-user-for-query.domain';
import { ChargebackUserDomainErrors } from '../../support/billing/chargeback-user.domain';
import { GetQueryPriceDomainErrors } from '../../support/billing/get-query-price.domain';
import { GetUserCurrentBalanceDomainErrors } from '../../support/billing/get-user-current-balance.domain';
import { GetUserDomainErrors } from '../user/get-user.domain';
import { CreateQueryDomainErrors } from './create-query.domain';
import { GetAlreadyDoneQueryDomainErrors } from './get-already-done-query.domain';
import { GetQueryComposerDomainErrors } from './get-query-composer.domain';
import { GetServicesFromQueryComposerDomainErrors } from './get-services-from-query-composer.domain';

export type RequestQueryDomainErrors =
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

export type RequestQueryResult = Either<RequestQueryDomainErrors, QueryRepresentationWithPopUpEntity>;

export type RequestQueryIO = EitherIO<RequestQueryDomainErrors, QueryRepresentationWithPopUpEntity>;

export abstract class RequestQueryDomain {
  readonly requestQuery: (
    token: string,
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ) => RequestQueryIO;
}
