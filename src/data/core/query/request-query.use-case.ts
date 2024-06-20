import { Either, EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { BillingType } from '../../../domain/_entity/billing.entity';
import { ClientType } from '../../../domain/_entity/client.entity';
import { QueryKeysEntity } from '../../../domain/_entity/query-keys.entity';
import { QueryRepresentationEntity } from '../../../domain/_entity/query-representation.entity';
import {
  LegacyQueryDomainError,
  NoUserFoundDomainError,
  UnknownDomainError,
} from '../../../domain/_entity/result.error';
import { BalanceDto } from '../../../domain/_layer/data/dto/balance.dto';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { QueryDto } from '../../../domain/_layer/data/dto/query.dto';
import { UserDto } from '../../../domain/_layer/data/dto/user.dto';
import { BillingRepository } from '../../../domain/_layer/infrastructure/repository/billing.repository';
import { UserRepository } from '../../../domain/_layer/infrastructure/repository/user.repository';
import { QueryLegacyService } from '../../../domain/_layer/infrastructure/service/query-legacy.service';
import { CreateQueryDomain, CreateQueryDomainErrors } from '../../../domain/core/query/create-query.domain';
import { RequestQueryDomain, RequestQueryIO } from '../../../domain/core/query/request-query.domain';
import { AssociateQueryAndConsumptionDomain } from '../../../domain/support/billing/associate-query-and-consumption.domain';
import { ChargeUserForQueryDomain } from '../../../domain/support/billing/charge-user-for-query.domain';
import { ChargebackUserDomain } from '../../../domain/support/billing/chargeback-user.domain';
import { QueryPopUpHelper } from './query-popup.helper';
import { QueryHelper } from './query.helper';

@Injectable()
export class RequestQueryUseCase implements RequestQueryDomain {
  constructor(
    private readonly _queryHelper: QueryHelper,
    private readonly _associateQueryAndConsumptionDomain: AssociateQueryAndConsumptionDomain,
    private readonly _chargebackUserDomain: ChargebackUserDomain,
    private readonly _chargeUserForQueryDomain: ChargeUserForQueryDomain,
    private readonly _createQueryDomain: CreateQueryDomain,
    private readonly _billingRepository: BillingRepository,
    private readonly _userRepository: UserRepository,
    private readonly _queryLegacyService: QueryLegacyService,
    private readonly _queryPopUpHelper: QueryPopUpHelper,
  ) {}

  private _externalRequest(
    token: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): RequestQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._queryLegacyService.requestQuery(token, queryCode, keys, clientType, mayDuplicate),
    )
      .filter(LegacyQueryDomainError.toFn(), (query: QueryRepresentationEntity) => !!query)
      .map(this._queryPopUpHelper.appendEmptyPopUpToQuery.bind(this._queryPopUpHelper));
  }

  private _internalRequest(
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): RequestQueryIO {
    return this._chargeUserForQueryDomain
      .chargeUserForQuery(userId, queryCode)
      .flatMap((balanceDto: BalanceDto) => {
        return this._createQueryDomain
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
      })
      .flatMap((queryDto: QueryDto) => this._queryHelper.getQueryRepresentation(queryDto, clientType))
      .flatMap((queryRepresentation: QueryRepresentationEntity) => {
        return this._queryPopUpHelper.makePopUpQueryRepresentation(queryRepresentation, clientType);
      });
  }

  private _isExternalRequest(userId: string): EitherIO<NoUserFoundDomainError, boolean> {
    return EitherIO.from(NoUserFoundDomainError.toFn(), async () => {
      const userDto: UserDto = await this._userRepository.getById(userId);
      const billingDto: BillingDto = await this._billingRepository.getByUser(userId);
      const isPartner: boolean = !!userDto.partnerId;
      const hasPartner: boolean = !!(userDto.hierarchy && userDto.hierarchy.partnerId);
      const isPostPaidBillingType: boolean = billingDto.billingType === BillingType.POST_PAID;
      return isPartner || hasPartner || isPostPaidBillingType;
    });
  }

  requestQuery(
    token: string,
    userId: string,
    queryCode: number,
    keys: QueryKeysEntity,
    clientType: ClientType,
    mayDuplicate: boolean,
  ): RequestQueryIO {
    return this._isExternalRequest(userId).flatMap((isExternal: boolean) => {
      return isExternal
        ? this._externalRequest(token, queryCode, keys, clientType, mayDuplicate)
        : this._internalRequest(userId, queryCode, keys, clientType, mayDuplicate);
    });
  }
}
