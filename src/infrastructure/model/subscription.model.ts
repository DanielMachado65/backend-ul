import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { PlanTag, planTag } from 'src/domain/_entity/plan.entity';
import {
  SubscriptionGateway,
  SubscriptionStatus,
  subscriptionGateway,
  subscriptionStatus,
} from 'src/domain/_entity/subscription.entity';

export type MSubscriptionDocument = MSubscription & mongoose.Document;

@Schema({ _id: false })
export class MSubscriptionPayment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPayment', required: true })
  payment: mongoose.Types.ObjectId;

  @Prop({ type: Number })
  refMonth: number;

  @Prop({ type: Number })
  refYear: number;

  @Prop({ type: Date, default: null })
  renewedAt: Date;
}

const mSubscriptionPayment: mongoose.Schema<MSubscriptionPayment & mongoose.Document> =
  SchemaFactory.createForClass(MSubscriptionPayment);

@Schema({ timestamps: true })
export class MSubscription {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MPlan',
    default: null,
    required: [true, 'The plan is required to create a new subscription'],
  })
  plan: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  creator: mongoose.Types.ObjectId;

  /** @deprecated */
  @Prop({ type: [mSubscriptionPayment] })
  payments: ReadonlyArray<MSubscriptionPayment>;

  /** @deprecated */
  @Prop({ type: Date, required: true })
  expireAt: Date;

  @Prop({
    type: String,
    default: 'all',
    enum: ['all', 'credit_card', 'bank_slip'],
    required: [true, 'Need be setted a payable way'],
  })
  payableWith: 'all' | 'credit_card' | 'bank_slip';

  @Prop({ type: Boolean, default: false })
  ignoreNotificationBilling: boolean;

  @Prop({ type: String, enum: [...subscriptionStatus.values()], default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Prop({ type: String, enum: [...planTag.values()], default: null })
  planTag: PlanTag;

  /** @deprecated */
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: String, enum: [...subscriptionGateway.values()], default: null })
  gateway: SubscriptionGateway;

  @Prop({ type: String, default: null })
  externalId: string;

  @Prop({ type: Date, default: null })
  deactivatedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MBilling', default: null })
  billingId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  nextChargeAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const mSubscriptionSchema: mongoose.Schema<MSubscriptionDocument> = SchemaFactory.createForClass(MSubscription);

export const mSubscriptionModelDef: ModelDefinition = { name: MSubscription.name, schema: mSubscriptionSchema };
