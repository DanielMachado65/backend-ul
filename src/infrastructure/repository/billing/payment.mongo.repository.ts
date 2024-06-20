import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import {
  GatewayHistoryArcDetail,
  PaymentDebtsItem,
  PaymentGatewayType,
  PaymentItem,
  PaymentStatus,
  PaymentType,
} from 'src/domain/_entity/payment.entity';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import {
  PaymentRepository,
  PaymentsSucceededByTenant,
} from 'src/domain/_layer/infrastructure/repository/payment.repository';
import { ENV_KEYS, EnvService } from 'src/infrastructure/framework/env.service';
import { MBilling } from 'src/infrastructure/model/billing.model';
import {
  MGatewayHistoryArcDetail,
  MPayment,
  MPaymentDebtsItem,
  MPaymentDocument,
  MPaymentItem,
} from 'src/infrastructure/model/payment.model';
import { MUser, MUserDocument } from 'src/infrastructure/model/user.model';
import { Currency, CurrencyUtil } from 'src/infrastructure/util/currency.util';
import { ObjectUtil } from 'src/infrastructure/util/object.util';
import { MongoBaseRepository, WithId, WithMongoId } from '../mongo.repository';

type PrePaymentsSucceededByTenant = Omit<PaymentsSucceededByTenant, 'revenueInCents'> & { readonly revenue: number };

@Injectable()
export class PaymentMongoRepository
  extends MongoBaseRepository<PaymentDto, MPayment>
  implements PaymentRepository<ClientSession>
{
  private readonly _originalCnpj: string;

  constructor(
    @InjectModel(MPayment.name) readonly model: Model<MPaymentDocument>,
    @InjectModel(MUser.name) private readonly _userModel: Model<MUserDocument>,
    @InjectModel(MBilling.name) private readonly _billingModel: Model<MBilling>,
    private readonly _envService: EnvService,
    private readonly _currencyUtil: CurrencyUtil,
    private readonly _objectUtil: ObjectUtil,
  ) {
    super();

    this.model = model;
    this._originalCnpj = _envService.get(ENV_KEYS.CNPJ1);
  }

  private _toCents(value: number): number {
    return this._currencyUtil.numToCurrency(value).toInt();
  }

  private _toReals(value: number): number {
    return this._currencyUtil.numToCurrency(value, Currency.CENTS_PRECISION).toFloat();
  }

  private static _searchByDate(search: string): unknown {
    if (search.length <= 2 && Number(search) <= 12 && Number(search) > 0) {
      return { refMonth: Number(search) - 1 };
    } else if (search.length === 4 && Number(search)) {
      return { refYear: Number(search) };
    } else {
      return {};
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  fromDtoToSchema(dto: PaymentDto): Required<MPayment> {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      billing: this.parseStringToObjectId(dto.billingId),
      debts: dto.debts && {
        installment: dto.debts.installment,
        items: dto.debts.items.map((item: PaymentDebtsItem) => ({
          protocol: item.protocol,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          amountInCents: item.amountInCents,
          dueDate: item.dueDate && new Date(item.dueDate),
          required: item.required,
          distinct: item.distinct,
          dependsOn: item.dependsOn,
        })),
      },
      items: dto.items?.map((item: PaymentItem) => ({
        name: item.name,
        value: item.unitValueInCents && this._toReals(item.unitValueInCents),
        realValue: item.totalValueInCents && this._toReals(item.totalValueInCents),
        amount: item.amount,
        queryId: this.parseStringToObjectId(item.queryId),
        packageid: this.parseStringToObjectId(item.packageId),
        signatureId: this.parseStringToObjectId(item.signatureId),
      })),
      chargeId: dto.chargeId,
      paymentExternalRef: dto.paymentExternalRef,
      gatewayDetails: {
        arc: {
          gatewayHistory: this._objectUtil.map(
            dto.gatewayDetails?.arc?.gatewayHistory ?? {},
            (_key: string, value: GatewayHistoryArcDetail): MGatewayHistoryArcDetail => ({
              referenceIn: value.referenceIn,
              createdAt: value.createdAt && new Date(value.createdAt),
            }),
          ),
        },
      },
      gateway: dto.gateway,
      status: dto.status,
      totalPrice: dto.totalPriceWithDiscountInCents && this._toReals(dto.totalPriceWithDiscountInCents),
      totalPaid: dto.totalPaidInCents && this._toReals(dto.totalPaidInCents),
      realPrice: dto.realPriceInCents && this._toReals(dto.realPriceInCents),
      paid: dto.paid,
      type: dto.type,
      cnpj: dto.cnpj,
      paymentDate: dto.paymentDate && new Date(dto.paymentDate),
      creditCard: dto.creditCard
        ? {
            token: dto.creditCard.token,
            installments: dto.creditCard.installments,
            installmentValue:
              typeof dto.creditCard.installmentValueInCents === 'number'
                ? this._toReals(dto.creditCard.installmentValueInCents)
                : this._toReals(dto.totalPriceWithDiscountInCents),
          }
        : {
            token: null,
            installments: 1,
            installmentValue: this._toReals(dto.totalPriceWithDiscountInCents),
          },
      bankingBillet: dto.bankingBillet && {
        barcode: dto.bankingBillet.barcode,
        link: dto.bankingBillet.link,
        expireAt: dto.bankingBillet.expireAt && new Date(dto.bankingBillet.expireAt),
      },
      pix: dto.pix,
      coupon: this.parseStringToObjectId(dto.couponId),
      nfe: this.parseStringToObjectId(dto.nfeId),
      refMonth: dto.refMonth,
      refYear: dto.refYear,
      creationOrigin: dto.creationOrigin,
    };
  }

  fromSchemaToDto(schema: WithId<MPayment>): Required<PaymentDto> {
    const status: PaymentStatus =
      schema.status === 'paid'
        ? PaymentStatus.PAID
        : schema.status === 'pending' || schema.status === 'new' || schema.status === 'waiting'
        ? PaymentStatus.PENDING
        : PaymentStatus.UNPAID;
    return {
      id: schema.id,
      createdAt: schema.createAt.toISOString(),
      billingId: this.parseObjectIdToString(schema.billing),
      debts: schema.debts && {
        installment: schema.debts.installment,
        items: schema.debts.items.map((item: MPaymentDebtsItem) => ({
          protocol: item.protocol,
          externalId: item.externalId,
          title: item.title,
          description: item.description,
          amountInCents: item.amountInCents,
          dueDate: item.dueDate?.toISOString(),
          required: item.required,
          distinct: item.distinct,
          dependsOn: item.dependsOn,
        })),
      },
      items: schema.items.map((item: MPaymentItem) => ({
        name: item.name,
        unitValueInCents: this._toCents(item.value),
        totalValueInCents: this._toCents(item.realValue),
        amount: item.amount,
        queryId: this.parseObjectIdToString(item.queryId),
        packageId: this.parseObjectIdToString(item.packageid),
        signatureId: this.parseObjectIdToString(item.signatureId),
      })),
      chargeId: schema.chargeId,
      paymentExternalRef: schema.paymentExternalRef,
      gatewayDetails: {
        arc: {
          gatewayHistory: this._objectUtil.map(
            schema?.gatewayDetails?.arc?.gatewayHistory ?? {},
            (_key: string, value: MGatewayHistoryArcDetail): GatewayHistoryArcDetail => ({
              referenceIn: value.referenceIn,
              createdAt: value.createdAt.toISOString(),
            }),
          ),
        },
      },
      gateway: schema.gateway,
      status: status,
      totalPriceWithDiscountInCents: this._toCents(schema.totalPrice),
      totalPriceInCents: this._toCents(schema.totalPrice),
      totalPaidInCents: this._toCents(schema.totalPaid),
      realPriceInCents: this._toCents(schema.realPrice),
      paid: schema.paid,
      type: schema.type as PaymentType,
      cnpj: schema.cnpj,
      paymentDate: schema.paymentDate?.toISOString(),
      creditCard: schema.creditCard && {
        token: schema.creditCard.token,
        installments: schema.creditCard.installments,
        installmentValueInCents: this._toCents(schema.creditCard.installmentValue),
      },
      bankingBillet: schema.bankingBillet && {
        barcode: schema.bankingBillet.barcode,
        link: schema.bankingBillet.link,
        expireAt: schema.bankingBillet.expireAt?.toISOString(),
      },
      pix: schema.pix,
      couponId: this.parseObjectIdToString(schema.coupon),
      nfeId: this.parseObjectIdToString(schema.nfe),
      refMonth: schema.refMonth,
      refYear: schema.refYear,
      creationOrigin: schema.creationOrigin,
    };
  }

  async getByExternalReferenceGateway(externalReference: string, gateway: PaymentGatewayType): Promise<PaymentDto> {
    const doc: MPayment = await this.model
      .findOne({
        gateway,
        $or: [{ paymentExternalRef: externalReference }, { chargeId: externalReference, paymentExternalRef: null }],
      })
      .lean()
      .exec();

    return this.normalize(doc);
  }

  async getByUserId(userId: string, page: number, perPage: number): Promise<ReadonlyArray<PaymentDto>> {
    const documents: ReadonlyArray<MPayment> = await this._billingModel.aggregate([
      { $match: { user: this.parseStringToObjectId(userId) } },
      { $lookup: { from: 'mpayments', localField: '_id', foreignField: 'billing', as: 'billing' } },
      { $unwind: '$billing' },
      { $replaceRoot: { newRoot: '$billing' } },
      { $skip: perPage * (page - 1) },
      { $limit: perPage },
    ]);
    return documents.map(this.normalize.bind(this));
  }

  async getByUserIdWithCount(
    userId: string,
    page: number,
    perPage: number,
    search: string,
  ): Promise<PaginationOf<PaymentDto>> {
    const mbilling: WithMongoId<MBilling> = (await this._billingModel.findOne({
      user: this.parseStringToObjectId(userId),
    })) as WithMongoId<MBilling>;

    const filter: FilterQuery<MBilling> = {
      $and: [{ billing: mbilling._id }, PaymentMongoRepository._searchByDate(search)],
    };
    const count: number = await this.model.find(filter).countDocuments();
    const data: ReadonlyArray<MPayment> = await this.model
      .find(filter)
      .skip(perPage * (page - 1))
      .limit(perPage)
      .sort({ _id: -1 })
      .lean()
      .exec();

    return this.normalizePagination({ data, count }, page, perPage);
  }

  async getByBillingId(billingId: string): Promise<ReadonlyArray<PaymentDto>> {
    const documents: ReadonlyArray<MPayment> = await this.model
      .find({ billing: billingId })
      .sort({ _id: -1 })
      .lean()
      .exec();
    return documents.map(this.normalize.bind(this));
  }

  async countAllFromBillingId(billingId: string): Promise<number> {
    return await this.model.countDocuments({ billing: billingId }).lean().exec();
  }

  async countAllFromUserId(userId: string): Promise<number> {
    const billingDocument: WithMongoId<MBilling> = (await this._billingModel
      .findOne({ user: this.parseStringToObjectId(userId) })
      .lean()
      .exec()) as WithMongoId<MBilling>;
    return await this.model.countDocuments({ billing: billingDocument._id }).lean().exec();
  }

  async countByBillingIdAndCouponId(billingId: string, couponId: string): Promise<number> {
    return this.model
      .countDocuments({
        billing: billingId,
        coupon: couponId,
        status: 'paid',
      })
      .exec();
  }

  async getByUserAndPaymentId(userId: string, paymentId: string): Promise<PaymentDto | null> {
    const documents: ReadonlyArray<MPayment> = await this._billingModel.aggregate([
      { $match: { user: this.parseStringToObjectId(userId) } },
      { $lookup: { from: 'mpayments', localField: '_id', foreignField: 'billing', as: 'payments' } },
      { $unwind: '$payments' },
      { $replaceRoot: { newRoot: '$payments' } },
      { $match: { _id: this.parseStringToObjectId(paymentId) } },
    ]);
    return documents[0] ? this.normalize(documents[0]) : null;
  }

  async getAmountSucceededByTenant(): Promise<ReadonlyArray<PaymentsSucceededByTenant>> {
    const documents: ReadonlyArray<PrePaymentsSucceededByTenant> = await this.model.aggregate([
      { $match: { paid: true } },
      { $match: { createAt: { $gte: new Date(new Date().toISOString().substring(0, 7) + '-01T00:00:00Z') } } },
      { $addFields: { cnpj: { $cond: { if: { $gt: ['$cnpj', null] }, then: '$cnpj', else: this._originalCnpj } } } },
      { $group: { _id: '$cnpj', paymentsAmount: { $sum: 1 }, revenue: { $sum: '$totalPaid' } } },
      { $project: { _id: 0, cnpj: '$_id', paymentsAmount: 1, revenue: 1 } },
    ]);

    return Array.isArray(documents) ? documents.map(this._parseToPaymentsSucceededByTenant.bind(this)) : [];
  }

  private _parseToPaymentsSucceededByTenant(document: PrePaymentsSucceededByTenant): PaymentsSucceededByTenant {
    return {
      cnpj: document.cnpj,
      paymentsAmount: document.paymentsAmount,
      revenueInCents: this._toCents(document.revenue),
    };
  }
}
