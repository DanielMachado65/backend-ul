import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MServiceLogDocument = MServiceLog & mongoose.Document;

@Schema({ _id: false })
export class MServiceLogReprocessing {
  @Prop({ type: Boolean, default: false })
  is: boolean;

  @Prop({ type: Number, default: 0 })
  count: number;

  @Prop({ type: Date, default: null })
  last: Date;

  @Prop({ type: Number, default: 0 })
  originalServiceCode: number;
}

const mServiceLogReprocessingSchema: mongoose.Schema<MServiceLogReprocessing & mongoose.Document> =
  SchemaFactory.createForClass(MServiceLogReprocessing);

@Schema()
export class MServiceLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', required: true })
  log: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  serviceCode: number;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: String, default: null })
  error: string;

  @Prop({ type: mServiceLogReprocessingSchema, default: new MServiceLogReprocessing() })
  reprocessing: MServiceLogReprocessing;
}

export const mServiceLogSchema: mongoose.Schema<MServiceLogDocument> = SchemaFactory.createForClass(MServiceLog);

export const mServiceLogModelDef: ModelDefinition = { name: MServiceLog.name, schema: mServiceLogSchema };
