import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
  PlanGateway,
  PlanIntervalFrequency,
  PlanStatus,
  planGateway,
  planIntervalFrequency,
  planStatus,
  PlanPayableWith,
  planTag,
  PlanTag,
} from 'src/domain/_entity/plan.entity';

const payableWithEnum: ReadonlyArray<string> = ['all', 'credit_card', 'bank_slip'];

export type MPlanDocument = MPlan & mongoose.Document;

@Schema({ _id: false })
export class MPlanLabels {
  @Prop({ type: String, default: null })
  value: string;

  @Prop({ type: String, default: null })
  description: string;
}

const mPlanLabels: mongoose.Schema<MPlanLabels & mongoose.Document> = SchemaFactory.createForClass(MPlanLabels);

@Schema({ timestamps: true })
export class MPlan {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  creator: mongoose.Types.ObjectId;

  /** @deprecated */
  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: String, enum: [...planStatus.values()], default: PlanStatus.DEACTIVE })
  state: PlanStatus;

  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({
    type: Number,
    default: 1,
    validate: {
      validator: (interval: number): boolean => interval >= 1 && !isNaN(interval),
      message: 'The billing interval must be greater than 1',
    },
  })
  interval: number;

  @Prop({
    type: String,
    enum: [...planIntervalFrequency.values()],
    default: PlanIntervalFrequency.MONTHS,
  })
  intervalType: PlanIntervalFrequency;

  @Prop({
    type: Number,
    default: 100,
    validate: {
      validator: (value: number): boolean => value >= 100 && !isNaN(value),
      message: 'The target value must be greater than 100',
    },
  })
  valueCents: number;

  /** @deprecated */
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Date, default: null })
  deactivatedAt: Date;

  @Prop({ type: String, default: null })
  description: string;

  /** @deprecated */
  @Prop({ type: [mPlanLabels], default: [] })
  textLabels: ReadonlyArray<MPlanLabels>;

  @Prop({ type: Boolean, default: false })
  addCredits: boolean;

  /** @deprecated */
  @Prop({ type: String, default: null })
  badgeImage: string;

  @Prop({
    type: String,
    enum: payableWithEnum,
    default: 'credit_card',
  })
  payableWith: PlanPayableWith;

  @Prop({ type: String, enum: [...planTag.values()], default: null })
  type: PlanTag;

  @Prop({ type: String, default: null })
  externalId: string;

  @Prop({ type: String, enum: [...planGateway.values()], required: true })
  gateway: PlanGateway;

  createdAt?: Date;
  updatedAt?: Date;
}

export const mPlanSchema: mongoose.Schema<MPlanDocument> = SchemaFactory.createForClass(MPlan);

export const mPlanModelDef: ModelDefinition = { name: MPlan.name, schema: mPlanSchema };
