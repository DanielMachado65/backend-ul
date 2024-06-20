import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, QueryOptions } from 'mongoose';
import {
  BillingInvoice,
  BillingPackage,
  BillingSubscription,
  BillingType,
} from '../../../domain/_entity/billing.entity';
import { BillingDto } from '../../../domain/_layer/data/dto/billing.dto';
import { BillingRepository } from '../../../domain/_layer/infrastructure/repository/billing.repository';
import {
  MBilling,
  MBillingDocument,
  MBillingInvoice,
  MBillingPackage,
  MBillingSubscription,
} from '../../model/billing.model';
import { Currency, CurrencyUtil } from '../../util/currency.util';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class BillingMongoRepository
  extends MongoBaseRepository<BillingDto, MBilling>
  implements BillingRepository<ClientSession>
{
  constructor(
    @InjectModel(MBilling.name) readonly model: Model<MBillingDocument>,
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

  fromDtoToSchema(dto: BillingDto): MBilling {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      billingType: dto.billingType,
      user: this.parseStringToObjectId(dto.userId),
      priceTable: this.parseStringToObjectId(dto.priceTableId),
      accountFunds: this._currencyUtil.numToCurrency(dto.accountFundsCents, Currency.CENTS_PRECISION).toFloat(),
      activeAccount: dto.activeAccount,
      isReliable: dto.isReliable,
      deadlineToPay: {
        initDate: dto.deadlineToPay?.initDate ? new Date(dto.deadlineToPay?.initDate) : new Date(),
        endDate: dto.deadlineToPay?.endDate ? new Date(dto.deadlineToPay?.endDate) : new Date(),
      },
      invoices: dto.invoices?.map((invoice: BillingInvoice) => ({
        invoice: this.parseStringToObjectId(invoice.invoiceId),
        insertDate: new Date(invoice.insertDate),
      })),
      packages: dto.packages?.map((pack: BillingPackage) => ({
        name: pack.name,
        amount: pack.amount,
        purchasePrice: this._toReals(pack.purchasePriceInCents),
        attributedValue: this._toReals(pack.attributedValueInCents),
        discountPercent: pack.discountPercent,
        accessionDate: new Date(pack.accessionDate),
      })),
      subscriptions: dto.subscriptions?.map((subscription: BillingSubscription) => ({
        subscription: this.parseStringToObjectId(subscription.subscriptionId),
      })),
      orderRoles: {
        hasUsedCouponOnFirstOrder: dto.orderRoles?.hasUsedCouponOnFirstOrder,
        coupon: this.parseStringToObjectId(dto.orderRoles?.couponId),
        couponCode: dto.orderRoles?.couponCode,
        isPartnerCoupon: dto.orderRoles?.isPartnerCoupon,
      },
    };
  }

  fromSchemaToDto(schema: WithId<MBilling>): BillingDto {
    return {
      id: schema.id.toString(),
      createdAt: schema.createAt?.toISOString(),
      billingType: schema.billingType as BillingType,
      accountFundsCents: this._currencyUtil.numToCurrency(schema.accountFunds).toInt(),
      activeAccount: schema.activeAccount,
      isReliable: schema.isReliable,
      userId: this.parseObjectIdToString(schema.user),
      priceTableId: this.parseObjectIdToString(schema.priceTable),
      deadlineToPay: {
        initDate: schema.deadlineToPay?.initDate?.toISOString(),
        endDate: schema.deadlineToPay?.endDate?.toISOString(),
      },
      invoices: schema.invoices?.map((invoice: MBillingInvoice) => ({
        invoiceId: this.parseObjectIdToString(invoice.invoice),
        insertDate: invoice.insertDate?.toISOString(),
      })),
      packages: schema.packages?.map((pack: MBillingPackage) => ({
        ...pack,
        attributedValue: pack.attributedValue,
        attributedValueInCents: this._toCents(pack.attributedValue),
        purchasePriceInCents: this._toCents(pack.purchasePrice),
        accessionDate: pack.accessionDate.toISOString(),
      })),
      subscriptions: schema.subscriptions?.map((subscription: MBillingSubscription) => ({
        subscriptionId: this.parseObjectIdToString(subscription.subscription),
      })),
      orderRoles: {
        hasUsedCouponOnFirstOrder: schema.orderRoles?.hasUsedCouponOnFirstOrder,
        couponId: this.parseObjectIdToString(schema.orderRoles?.coupon),
        couponCode: schema.orderRoles?.couponCode,
        isPartnerCoupon: schema.orderRoles?.isPartnerCoupon,
      },
    };
  }

  async getByUser(userId: string): Promise<BillingDto> {
    return this.getBy({ user: userId });
  }

  async updateAccountFunds(
    userId: string,
    incrementInCents: number,
    session: ClientSession = null,
  ): Promise<BillingDto> {
    const options: QueryOptions = { new: true, runValidators: true, session: session };
    const incrementFunds: number = this._currencyUtil
      .numToCurrency(incrementInCents, Currency.CENTS_PRECISION)
      .toFloat();
    const result: MBilling | null = await this.model
      .findOneAndUpdate({ user: userId }, { $inc: { accountFunds: incrementFunds } }, options)
      .lean()
      .exec();
    return result ? this.normalize(result) : null;
  }
}
