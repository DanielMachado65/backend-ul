import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MFeedbackDocument = MFeedback & mongoose.Document;

@Schema()
export class MFeedback {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  query: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  evaluation: number;

  @Prop({ type: String, required: false, default: '' })
  description?: string;

  @Prop({ type: Number, required: true })
  refMonth: number;

  @Prop({ type: Number, required: true })
  refYear: number;

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt: string;
}

export const mFeedbackSchema: mongoose.Schema<MFeedbackDocument> = SchemaFactory.createForClass(MFeedback);

export const mFeedbackModelDef: ModelDefinition = { name: MFeedback.name, schema: mFeedbackSchema };
