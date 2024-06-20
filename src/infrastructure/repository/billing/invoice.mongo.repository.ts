import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { MInvoice, MInvoiceAccumulatedInvoices, MInvoiceDiscount, MInvoiceDocument } from '../../model/invoice.model';
import { InvoiceDto } from '../../../domain/_layer/data/dto/invoice.dto';
import { MongoBaseRepository, WithId } from '../mongo.repository';
import { InvoiceRepository } from '../../../domain/_layer/infrastructure/repository/invoice.repository';
import { Currency, CurrencyUtil } from '../../util/currency.util';
import { InvoiceAccumulatedInvoices, InvoiceDiscount } from '../../../domain/_entity/invoice.entity';

@Injectable()
export class InvoiceMongoRepository
  extends MongoBaseRepository<InvoiceDto, MInvoice>
  implements InvoiceRepository<ClientSession>
{
  constructor(
    @InjectModel(MInvoice.name) readonly model: Model<MInvoiceDocument>,
    private readonly _currencyUtil: CurrencyUtil,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: InvoiceDto): MInvoice {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      initialDate: dto.initialDate ? new Date(dto.initialDate) : new Date(),
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : new Date(),
      billing: this.parseStringToObjectId(dto.billingId),
      payment: this.parseStringToObjectId(dto.paymentId),
      consumptionStatementLote: dto.consumptionStatementIds.map(this.parseStringToObjectId),
      status: dto.status,
      value: dto.valueCents && this._currencyUtil.numToCurrency(dto.valueCents, Currency.CENTS_PRECISION).toFloat(),
      paymenteDate: dto.paymentDate ? new Date(dto.paymentDate) : new Date(),
      notification: dto.invoiceNotification && {
        sentEmails: dto.invoiceNotification.sentEmails,
        hasBeenNotified: dto.invoiceNotification.hasBeenNotified,
        lastNotificationDate: dto.invoiceNotification.lastNotificationDate
          ? new Date(dto.invoiceNotification.lastNotificationDate)
          : new Date(),
      },
      accumulatedInvoices: dto.accumulatedInvoices.map((invoice: InvoiceAccumulatedInvoices) => ({
        description: invoice.description,
        totalValue:
          invoice.totalValueCents &&
          this._currencyUtil.numToCurrency(invoice.totalValueCents, Currency.CENTS_PRECISION).toFloat(),
        createAt: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
        refInvoice: this.parseStringToObjectId(invoice.refInvoiceId),
      })),
      discounts: dto.discounts.map((discount: InvoiceDiscount) => ({
        motive: discount.motive,
        user: this.parseStringToObjectId(discount.userId),
        createAt: discount.createdAt ? new Date(discount.createdAt) : new Date(),
        value:
          discount.valueCents &&
          this._currencyUtil.numToCurrency(discount.valueCents, Currency.CENTS_PRECISION).toFloat(),
      })),
      refYear: dto.refYear,
      refMonth: dto.refMonth,
    };
  }

  fromSchemaToDto(schema: WithId<MInvoice>): InvoiceDto {
    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      initialDate: schema.initialDate.toISOString(),
      expirationDate: schema.expirationDate.toISOString(),
      status: schema.status,
      valueCents: this._currencyUtil.numToCurrency(schema.value).toInt(),
      paymentDate: schema.paymenteDate.toISOString(),
      refYear: schema.refYear,
      refMonth: schema.refMonth,
      billingId: this.parseObjectIdToString(schema.billing),
      paymentId: this.parseObjectIdToString(schema.payment),
      invoiceNotification: {
        sentEmails: schema.notification.sentEmails,
        hasBeenNotified: schema.notification.hasBeenNotified,
        lastNotificationDate: schema.notification?.lastNotificationDate?.toISOString(),
      },
      accumulatedInvoices: schema.accumulatedInvoices.map((invoice: MInvoiceAccumulatedInvoices) => ({
        description: invoice.description,
        totalValueCents: this._currencyUtil.numToCurrency(invoice.totalValue).toInt(),
        createdAt: invoice.createAt?.toISOString(),
        refInvoiceId: this.parseObjectIdToString(invoice.refInvoice),
      })),
      discounts: schema.discounts.map((discount: MInvoiceDiscount) => ({
        motive: discount.motive,
        userId: this.parseObjectIdToString(discount.user),
        createdAt: discount.createAt?.toISOString(),
        valueCents: this._currencyUtil.numToCurrency(discount.value).toInt(),
      })),
      consumptionStatementIds: schema.consumptionStatementLote.map(this.parseObjectIdToString),
    };
  }
}
