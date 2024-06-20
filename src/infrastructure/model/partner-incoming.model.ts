import * as mongoose from 'mongoose';
import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type MPartnerIncomingDocument = MPartnerIncoming & mongoose.Document;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
export class MPartnerIncoming {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', required: true })
  partner: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPayment', required: true })
  payment: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MCoupon', required: true })
  coupon: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  couponCode: string;

  @Prop({ type: Number, default: 0 })
  incomingRefValue: number;

  createdAt: Date;

  updatedAt: Date;
}

export const mPartnerIncomingSchema: mongoose.Schema<MPartnerIncomingDocument> =
  SchemaFactory.createForClass(MPartnerIncoming);

export const mPartnerIncomingModelDef: ModelDefinition = {
  name: MPartnerIncoming.name,
  schema: mPartnerIncomingSchema,
};
