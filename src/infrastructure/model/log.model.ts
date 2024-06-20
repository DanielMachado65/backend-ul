import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MLogDocument = MLog & mongoose.Document;

@Schema()
export class MLog {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQuery', required: true })
  query: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop({ type: String, default: null })
  error: string;

  @Prop({ type: String, default: 0 })
  code: number;
}

export const mLogSchema: mongoose.Schema<MLogDocument> = SchemaFactory.createForClass(MLog);

export const mLogModelDef: ModelDefinition = { name: MLog.name, schema: mLogSchema };
