import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { billingTypes } from '../../domain/_entity/billing.entity';

export type MBillingDocument = MBilling & mongoose.Document;

@Schema({ _id: false })
export class MBillingInvoice {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MInvoice', default: null })
  invoice?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  insertDate: Date;
}

const mBillingInvoiceSchema: mongoose.Schema<MBillingInvoice & mongoose.Document> =
  SchemaFactory.createForClass(MBillingInvoice);

@Schema({ _id: false })
export class MBillingPackage {
  @Prop({ type: Number, default: 0.0 })
  purchasePrice: number;

  @Prop({ type: Number, default: 0.0 })
  attributedValue: number;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Date, default: Date.now })
  accessionDate: Date;

  @Prop({ type: Number, default: 1 })
  amount: number;

  @Prop({ type: Number, default: 0.0 })
  discountPercent: number;
}

const mBillingPackageSchema: mongoose.Schema<MBillingPackage & mongoose.Document> =
  SchemaFactory.createForClass(MBillingPackage);

// export class MBillingFinancialLock {
//   value: number;
// }
//
// export class MBillingHierarchy {
//   mothersWallet: MBilling;
// }
//
// export class MBillingPayment {
//   expirationDay: number;
// }

@Schema({ _id: false })
export class MBillingDeadlineToPay {
  @Prop({ type: Date, default: null })
  initDate: Date;

  @Prop({ type: Date, default: null })
  endDate: Date;
}

const mBillingDeadlineToPaySchema: mongoose.Schema<MBillingDeadlineToPay & mongoose.Document> =
  SchemaFactory.createForClass(MBillingDeadlineToPay);

@Schema({ _id: false })
export class MBillingSubscription {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MSubscription' }] })
  subscription: mongoose.Types.ObjectId;
}

const mBillingSubscriptionSchema: mongoose.Schema<MBillingSubscription & mongoose.Document> =
  SchemaFactory.createForClass(MBillingSubscription);

@Schema({ _id: false })
export class MBillingOrderRoles {
  @Prop({ type: Boolean, default: false })
  hasUsedCouponOnFirstOrder: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MCoupon', default: null })
  coupon: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  couponCode: string;

  @Prop({ type: Boolean, default: null })
  isPartnerCoupon: boolean;
}

const mBillingOrderRolesSchema: mongoose.Schema<MBillingOrderRoles & mongoose.Document> =
  SchemaFactory.createForClass(MBillingOrderRoles);

@Schema()
export class MBilling {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Number, required: true, enum: billingTypes })
  billingType: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPriceTable', default: null })
  priceTable?: mongoose.Types.ObjectId;

  // fatmin: number;

  // dspac: number;

  @Prop({ type: [{ type: mBillingInvoiceSchema }], default: [] })
  invoices: ReadonlyArray<MBillingInvoice>;

  @Prop({ type: [{ type: mBillingPackageSchema }], default: [] })
  packages: ReadonlyArray<MBillingPackage>;

  @Prop({ type: Number, default: 0.0 })
  accountFunds: number;

  // financialLock: MBillingFinancialLock;

  @Prop({ type: Boolean, default: true })
  activeAccount: boolean;

  // billingHierarchy: MBillingHierarchy;

  // payment: MBillingPayment;

  @Prop({ type: mBillingDeadlineToPaySchema, default: new MBillingDeadlineToPay() })
  deadlineToPay: MBillingDeadlineToPay;

  @Prop({ type: Boolean, default: false })
  isReliable: boolean;

  @Prop({ type: [{ type: mBillingSubscriptionSchema }], default: [] })
  subscriptions: ReadonlyArray<MBillingSubscription>;

  @Prop({ type: mBillingOrderRolesSchema, default: new MBillingOrderRoles() })
  orderRoles: MBillingOrderRoles;
}

export const mBillingSchema: mongoose.Schema<MBillingDocument> = SchemaFactory.createForClass(MBilling);

export const mBillingModelDef: ModelDefinition = { name: MBilling.name, schema: mBillingSchema };
