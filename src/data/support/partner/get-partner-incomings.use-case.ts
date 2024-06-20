import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { IncomingGroupedByCouponDto } from '../../../domain/_layer/data/dto/incoming-grouped-by-coupon.dto';
import { Injectable } from '@nestjs/common';
import {
  PartnerIncomingDomain,
  PartnerIncomingsIO,
} from '../../../domain/support/partner/get-partner-incomings.domain';
import { PartnerIncomingRepository } from '../../../domain/_layer/infrastructure/repository/partner-incoming.repository';
import { UnknownDomainError } from '../../../domain/_entity/result.error';

type DateRange = {
  readonly start: Date;
  readonly end: Date;
};

@Injectable()
export class GetPartnerIncomingsUseCase implements PartnerIncomingDomain {
  constructor(private readonly _partnerIncomingRepository: PartnerIncomingRepository) {}

  getPartnerIncomings(userId: string, month: number, year: number): PartnerIncomingsIO {
    const { start, end }: DateRange = this._dateRange(month, year);

    return EitherIO.from(UnknownDomainError.toFn(), () =>
      this._partnerIncomingRepository.getIncomingGroupedByCoupon(userId, start, end),
    ).map((incomings: ReadonlyArray<IncomingGroupedByCouponDto>) => (Array.isArray(incomings) ? incomings : []));
  }

  private _dateRange(month: number, year: number): DateRange {
    const start: Date = new Date(year, month, 1, 0, 0, 0, 0);
    const end: Date = new Date(year, month + 1, 1, 0, 0, 0, 0);

    return { start, end };
  }
}
