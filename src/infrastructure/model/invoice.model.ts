import * as mongoose from 'mongoose';
import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { allInvoiceStatus, InvoiceStatus } from '../../domain/_entity/invoice.entity';

export type MInvoiceDocument = MInvoice & mongoose.Document;

@Schema({ _id: false })
export class MInvoiceNotification {
  @Prop({ type: Number, default: 0 })
  sentEmails: number;

  @Prop({ type: Boolean, default: false })
  hasBeenNotified: boolean;

  @Prop({ type: Date, default: null })
  lastNotificationDate: Date;
}

const mInvoiceNotificationSchema: mongoose.Schema<MInvoiceNotification & mongoose.Document> =
  SchemaFactory.createForClass(MInvoiceNotification);

@Schema({ _id: false })
export class MInvoiceAccumulatedInvoices {
  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: Number, default: 0.0 })
  totalValue: number;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MInvoice', default: null })
  refInvoice: mongoose.Types.ObjectId;
}

const mInvoiceAccumulatedInvoicesSchema: mongoose.Schema<MInvoiceAccumulatedInvoices & mongoose.Document> =
  SchemaFactory.createForClass(MInvoiceAccumulatedInvoices);

@Schema({ _id: false })
export class MInvoiceDiscount {
  @Prop({ type: String, default: null })
  motive: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Number, default: 0.0 })
  value: number;
}

const mInvoiceDiscountSchema: mongoose.Schema<MInvoiceDiscount & mongoose.Document> =
  SchemaFactory.createForClass(MInvoiceDiscount);

@Schema()
export class MInvoice {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Date, default: null })
  initialDate: Date;

  @Prop({ type: Date, default: null })
  expirationDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MBilling', default: null })
  billing: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPayment', default: null })
  payment: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MConsumptionStatement' }] })
  consumptionStatementLote: ReadonlyArray<mongoose.Types.ObjectId>;

  @Prop({ type: String, default: InvoiceStatus.OPENED, enum: allInvoiceStatus })
  status: string;

  @Prop({ type: Number, default: 0.0 })
  value: number;

  @Prop({ type: Date, default: null })
  paymenteDate: Date;

  @Prop({ type: mInvoiceNotificationSchema, default: new MInvoiceNotification() })
  notification: MInvoiceNotification;

  @Prop({ type: [{ type: mInvoiceAccumulatedInvoicesSchema }], default: [] })
  accumulatedInvoices: ReadonlyArray<MInvoiceAccumulatedInvoices>;

  @Prop({ type: [{ type: mInvoiceDiscountSchema }], default: [] })
  discounts: ReadonlyArray<MInvoiceDiscount>;

  @Prop({ type: Number, default: 0 })
  refYear: number;

  @Prop({ type: Number, default: 0 })
  refMonth: number;
}

export const mInvoiceSchema: mongoose.Schema<MInvoiceDocument> = SchemaFactory.createForClass(MInvoice);

export const mInvoiceModelDef: ModelDefinition = { name: MInvoice.name, schema: mInvoiceSchema };
