import { ClientSession, Model } from 'mongoose';
import { Currency, CurrencyUtil } from '../../util/currency.util';
import { IncomingGroupedByCouponDto } from '../../../domain/_layer/data/dto/incoming-grouped-by-coupon.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { MPartnerIncoming, MPartnerIncomingDocument } from '../../model/partner-incoming.model';
import { PartnerIncomingDto } from '../../../domain/_layer/data/dto/partner-incoming.dto';
import { PartnerIncomingRepository } from '../../../domain/_layer/infrastructure/repository/partner-incoming.repository';

type IncomingGroupedByCouponAggregate = {
  readonly couponCode: string;
  readonly amountToPay: number;
  readonly amountUsed: number;
};

@Injectable()
export class PartnerIncomingMongoRepository
  extends MongoBaseRepository<PartnerIncomingDto, MPartnerIncoming>
  implements PartnerIncomingRepository<ClientSession>
{
  constructor(
    @InjectModel(MPartnerIncoming.name) readonly model: Model<MPartnerIncomingDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  private _toCents(value: number): number {
    return this._currencyUtil.numToCurrency(value).toInt();
  }

  private _toReals(value: number): number {
    return this._currencyUtil.numToCurrency(value, Currency.CENTS_PRECISION).toFloat();
  }

  fromDtoToSchema(dto: Partial<PartnerIncomingDto>): Partial<MPartnerIncoming> {
    return {
      partner: this.parseStringToObjectId(dto.partnerId),
      user: this.parseStringToObjectId(dto.userId),
      payment: this.parseStringToObjectId(dto.paymentId),
      coupon: this.parseStringToObjectId(dto.couponId),
      couponCode: dto.couponCode,
      incomingRefValue: this._toReals(dto.incomingRefValueCents),
    };
  }

  fromSchemaToDto(schema: WithId<MPartnerIncoming>): PartnerIncomingDto {
    return {
      id: schema.id,
      partnerId: this.parseObjectIdToString(schema.partner),
      userId: this.parseObjectIdToString(schema.user),
      paymentId: this.parseObjectIdToString(schema.payment),
      couponId: this.parseObjectIdToString(schema.coupon),
      couponCode: schema.couponCode,
      incomingRefValueCents: this._toCents(schema.incomingRefValue),
      createdAt: schema.createdAt?.toISOString(),
      updatedAt: schema.updatedAt?.toISOString(),
    };
  }

  async getIncomingGroupedByCoupon(
    userId: string,
    inclusiveStartDate: Date,
    exclusiveEndDate: Date,
  ): Promise<ReadonlyArray<IncomingGroupedByCouponDto>> {
    const documents: ReadonlyArray<IncomingGroupedByCouponAggregate> = await this.model.aggregate([
      {
        $match: {
          partner: this.parseStringToObjectId(userId),
        },
      },
      {
        $match: {
          createdAt: {
            $gte: inclusiveStartDate,
            $lt: exclusiveEndDate,
          },
        },
      },
      {
        $group: {
          _id: '$couponCode',
          amountToPay: { $sum: '$incomingRefValue' },
          amountUsed: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          couponCode: '$_id',
          amountToPay: 1,
          amountUsed: 1,
        },
      },
    ]);

    return documents.map((document: IncomingGroupedByCouponAggregate) => ({
      couponCode: document.couponCode,
      amountToPayCents: this._toCents(document.amountToPay),
      amountUsed: document.amountUsed,
    }));
  }
}
