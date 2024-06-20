import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { QueryEntity } from 'src/domain/_entity/query.entity';
import { ClientType } from '../../../_entity/client.entity';
import { QueryKeysEntity } from '../../../_entity/query-keys.entity';
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

export type RequestQueryV2DomainErrors =
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

export type RequestQueryV2Result = Either<RequestQueryV2DomainErrors, QueryEntity>;

export type RequestQueryV2IO = EitherIO<RequestQueryV2DomainErrors, QueryEntity>;

export abstract class RequestQueryV2Domain {
  readonly requestQuery: (
    token: string,
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ) => RequestQueryV2IO;
}
