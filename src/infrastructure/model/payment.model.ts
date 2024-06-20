import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
  allPaymentCreationOrigin,
  allPaymentStatus,
  PaymentCreationOrigin,
  PaymentGatewayType,
  PaymentStatus,
} from 'src/domain/_entity/payment.entity';
import { DateTime } from '../util/date-time-util.service';

export type MPaymentDocument = MPayment & mongoose.Document;

const allGatewaysGatewaysType: ReadonlyArray<PaymentGatewayType> = [
  PaymentGatewayType.ARC,
  PaymentGatewayType.GERENCIA_NET,
  PaymentGatewayType.IUGU,
  PaymentGatewayType.ASAAS,
  PaymentGatewayType.MERCADO_PAGO,
  PaymentGatewayType.UNKNOWN,
];

@Schema({ _id: false })
export class MPaymentDebtsInstallment {
  @Prop({ type: Number, default: 0 })
  fee: number;

  @Prop({ type: Number, default: 0 })
  numberOfInstallments: number;

  @Prop({ type: String, default: null })
  coupon: string;

  @Prop({ type: String, default: null })
  type: string;

  @Prop({ type: Number, default: 0 })
  priceInCents: number;

  @Prop({ type: Number, default: 0 })
  monthlyFee: number;

  @Prop({ type: Number, default: 0 })
  priceWithInterestInCents: number;
}

const mPaymentDebtsInstallment: mongoose.Schema<MPaymentDebtsInstallment & mongoose.Document> =
  SchemaFactory.createForClass(MPaymentDebtsInstallment);

@Schema({ _id: false })
export class MPaymentDebtsItem {
  @Prop({ type: String, default: null })
  protocol: string;

  @Prop({ type: String, default: null })
  externalId: string;

  @Prop({ type: String, default: null })
  title: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: Number, default: 0 })
  amountInCents: number;

  @Prop({ type: Date, default: null })
  dueDate: Date;

  @Prop({ type: Boolean, default: false })
  required: boolean;

  @Prop({ type: [{ type: String }], default: [] })
  distinct: ReadonlyArray<string>;

  @Prop({ type: [{ type: String }], default: [] })
  dependsOn: ReadonlyArray<string>;
}

const mPaymentDebtsItem: mongoose.Schema<MPaymentDebtsItem & mongoose.Document> =
  SchemaFactory.createForClass(MPaymentDebtsItem);

@Schema({ _id: false })
export class MPaymentDebts {
  @Prop({ type: mPaymentDebtsInstallment, default: new MPaymentDebtsInstallment() })
  installment: MPaymentDebtsInstallment;

  @Prop({ type: [{ type: mPaymentDebtsItem }], default: [] })
  items: ReadonlyArray<MPaymentDebtsItem>;
}

const mPaymentDebts: mongoose.Schema<MPaymentDebts & mongoose.Document> = SchemaFactory.createForClass(MPaymentDebts);

@Schema({ _id: false })
export class MPaymentItem {
  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Number, default: 0 })
  realValue: number;

  @Prop({ type: Number, default: 0 })
  value: number;

  @Prop({ type: Number, default: 0 })
  amount: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MQueryComposer',
    default: null,
  })
  queryId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MPackage',
    default: null,
  })
  packageid: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MPlan',
    default: null,
  })
  signatureId: mongoose.Types.ObjectId;
}

const mPaymentItem: mongoose.Schema<MPaymentItem & mongoose.Document> = SchemaFactory.createForClass(MPaymentItem);

@Schema({ _id: false })
export class MPaymentCreditCard {
  @Prop({ type: String })
  token: string;

  @Prop({ type: Number, default: 1 })
  installments: number;

  @Prop({ type: Number })
  installmentValue: number;
}

const mPaymentCreditCard: mongoose.Schema<MPaymentCreditCard & mongoose.Document> =
  SchemaFactory.createForClass(MPaymentCreditCard);

@Schema({ _id: false })
export class MPaymentBankingBillet {
  @Prop({ type: String })
  barcode: string;

  @Prop({ type: String })
  link: string;

  @Prop({ type: Date, default: null })
  expireAt: Date;
}

const mPaymentBankingBillet: mongoose.Schema<MPaymentBankingBillet & mongoose.Document> =
  SchemaFactory.createForClass(MPaymentBankingBillet);

@Schema({ _id: false })
export class MPaymentPix {
  @Prop({ type: String })
  qrcode: string;

  @Prop({ type: String })
  qrcodeText: string;
}

const mPaymentPix: mongoose.Schema<MPaymentPix & mongoose.Document> = SchemaFactory.createForClass(MPaymentPix);

@Schema({ _id: false })
export class MGatewayHistoryArcDetail {
  @Prop({ type: String })
  referenceIn: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

@Schema({ _id: false })
export class MGatewayArcDetails {
  @Prop({ type: mongoose.Schema.Types.Mixed, required: true, default: {} })
  gatewayHistory: Record<string, MGatewayHistoryArcDetail>;
}

const mGatewayArcDetails: mongoose.Schema<MGatewayArcDetails & mongoose.Document> =
  SchemaFactory.createForClass(MGatewayArcDetails);

@Schema({ _id: false })
export class MGatewayDetails {
  @Prop({ type: mGatewayArcDetails })
  arc: MGatewayArcDetails | null;
}

const mGatewayDetails: mongoose.Schema<MGatewayDetails & mongoose.Document> =
  SchemaFactory.createForClass(MGatewayDetails);

@Schema()
export class MPayment {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MBilling', required: true })
  billing: mongoose.Types.ObjectId;

  @Prop({ type: mPaymentDebts, default: new MPaymentDebts() })
  debts: MPaymentDebts;

  @Prop({ type: [{ type: mPaymentItem }], default: [] })
  items: ReadonlyArray<MPaymentItem>;

  @Prop({ type: String, default: null })
  chargeId: string;

  @Prop({ type: String, default: null })
  paymentExternalRef: string;

  @Prop({ type: mGatewayDetails, default: new MGatewayDetails() })
  gatewayDetails: MGatewayDetails;

  @Prop({ type: String, enum: allGatewaysGatewaysType, default: PaymentGatewayType.UNKNOWN })
  gateway: PaymentGatewayType;

  @Prop({ type: String, default: PaymentStatus.PENDING, enum: allPaymentStatus })
  status: string;

  @Prop({ type: Number, default: 0 })
  totalPrice: number;

  @Prop({ type: Number, default: 0 })
  totalPaid: number;

  @Prop({ type: Number, default: 0 })
  realPrice: number;

  @Prop({ type: Boolean, default: false })
  paid: boolean;

  @Prop({ type: String, default: null })
  type: string;

  @Prop({ type: String, default: null })
  cnpj: string;

  @Prop({ type: Date, default: null })
  paymentDate: Date;

  @Prop({ type: mPaymentCreditCard, default: new MPaymentCreditCard() })
  creditCard: MPaymentCreditCard;

  @Prop({ type: mPaymentBankingBillet, default: new MPaymentBankingBillet() })
  bankingBillet: MPaymentBankingBillet;

  @Prop({ type: mPaymentPix, default: new MPaymentPix() })
  pix: MPaymentPix;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MCoupon', default: null })
  coupon: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MNFe', default: null })
  nfe: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: () => DateTime.now().getMonth() })
  refMonth: number;

  @Prop({ type: Number, default: () => DateTime.now().getYear() })
  refYear: number;

  @Prop({ type: String, enum: allPaymentCreationOrigin, default: PaymentCreationOrigin.UNKNOWN })
  creationOrigin: PaymentCreationOrigin;
}

export const mPaymentSchema: mongoose.Schema<MPaymentDocument> = SchemaFactory.createForClass(MPayment);

export const mPaymentModelDef: ModelDefinition = { name: MPayment.name, schema: mPaymentSchema };
