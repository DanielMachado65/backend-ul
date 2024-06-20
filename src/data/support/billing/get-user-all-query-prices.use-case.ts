import { Injectable } from '@nestjs/common';

import { DetailedPriceTableTemplate } from 'src/domain/_layer/data/dto/price-table.dto';
import { FeatureFlagPerRequestService } from 'src/domain/_layer/infrastructure/service/feature-flag-per-request.service';
import { AppFeatures } from 'src/domain/_layer/infrastructure/service/feature-flag.service';
import {
  GetUserAllQueryPricesDomain,
  GetUserAllQueryPricesIO,
} from 'src/domain/support/billing/get-user-price-table.domain';
import { BillingHelper } from './billing.helper';

@Injectable()
export class GetUserAllQueryPricesUseCase implements GetUserAllQueryPricesDomain {
  private static readonly CREDIT_SCORE_QUERY_CODE: number = 27;

  constructor(
    private readonly _billingHelper: BillingHelper,
    private readonly _featureFlagService: FeatureFlagPerRequestService,
  ) {}

  private _filterForMobile(isMobile: boolean) {
    return (queries: ReadonlyArray<DetailedPriceTableTemplate>): ReadonlyArray<DetailedPriceTableTemplate> => {
      if (isMobile === false) return queries;

      const isOnQueryScore: boolean = this._featureFlagService.isOn(AppFeatures.uluruQueryScore);
      if (isOnQueryScore === true) return queries;

      return queries.filter(
        (query: DetailedPriceTableTemplate) =>
          Number(query.querycode) !== GetUserAllQueryPricesUseCase.CREDIT_SCORE_QUERY_CODE,
      );
    };
  }

  private _setUserId(userId: string) {
    return async (): Promise<void> => {
      if (!userId) return;

      await this._featureFlagService.setAttributes({ userId });
    };
  }

  getUserAllQueryPrice(userId?: string, isMobile: boolean = false): GetUserAllQueryPricesIO {
    return this._billingHelper
      .getUserAllQueryPrices(userId)
      .tap(this._setUserId(userId))
      .map(this._filterForMobile(isMobile));
  }
}
