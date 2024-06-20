import { Either } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { CreateQueryV2Domain } from 'src/domain/core/query/v2/create-query-v2.domain';
import { RequestQueryV2Domain, RequestQueryV2IO } from 'src/domain/core/query/v2/request-query-v2.domain';
import { ClientType } from '../../../../domain/_entity/client.entity';
import { QueryKeysEntity } from '../../../../domain/_entity/query-keys.entity';
import { BalanceDto } from '../../../../domain/_layer/data/dto/balance.dto';
import { QueryDto } from '../../../../domain/_layer/data/dto/query.dto';
import { CreateQueryDomainErrors } from '../../../../domain/core/query/create-query.domain';
import { AssociateQueryAndConsumptionDomain } from '../../../../domain/support/billing/associate-query-and-consumption.domain';
import { ChargeUserForQueryDomain } from '../../../../domain/support/billing/charge-user-for-query.domain';
import { ChargebackUserDomain } from '../../../../domain/support/billing/chargeback-user.domain';

@Injectable()
export class RequestQueryV2UseCase implements RequestQueryV2Domain {
  constructor(
    private readonly _associateQueryAndConsumptionDomain: AssociateQueryAndConsumptionDomain,
    private readonly _chargebackUserDomain: ChargebackUserDomain,
    private readonly _chargeUserForQueryDomain: ChargeUserForQueryDomain,
    private readonly _createQueryV2Domain: CreateQueryV2Domain,
  ) {}

  private _internalRequest(
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): RequestQueryV2IO {
    return this._chargeUserForQueryDomain.chargeUserForQuery(userId, queryCode).flatMap((balanceDto: BalanceDto) => {
      return this._createQueryV2Domain
        .createQuery(userId, queryCode, keys, mayDuplicate)
        .tap(async (queryDto: QueryDto) => {
          await this._associateQueryAndConsumptionDomain
            .associateQueryAndConsumption(balanceDto.consumptionItemId, queryDto.id)
            .unsafeRun();
        })
        .catch(async (error: CreateQueryDomainErrors) => {
          await this._chargebackUserDomain.chargebackUser(balanceDto.id).unsafeRun();
          return Either.left(error);
        });
    });
  }

  requestQuery(
    token: string,
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): RequestQueryV2IO {
    return this._internalRequest(userId, queryCode, keys, clientType, mayDuplicate);
  }
}
