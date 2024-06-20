import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MSpanLogDocument = MSpanLog & mongoose.Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class MSpanLog {
  // This ID may be a reference when the flow is a request, in case of background jobs this may not be true
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MHttpLog', default: null })
  traceId: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  traceName: string;

  @Prop({ type: String, default: null })
  targetName: string;

  @Prop({ type: Date, default: null })
  startAt: Date;

  @Prop({ type: Date, default: null })
  endAt: Date;

  @Prop({ type: Number, default: null })
  spanTime: number;

  @Prop({ type: Boolean, default: null })
  isSuccess: boolean;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  params: ReadonlyArray<unknown>;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: null })
  response: unknown;

  createdAt: Date;
}

export const mSpanLogSchema: mongoose.Schema<MSpanLogDocument> = SchemaFactory.createForClass(MSpanLog);

export const mSpanLogModelDef: ModelDefinition = { name: MSpanLog.name, schema: mSpanLogSchema };
