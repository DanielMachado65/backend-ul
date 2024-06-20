import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HttpLogReqParams } from 'src/domain/_entity/http-log.entity';

export type MHttpLogDocument = MHttpLog & mongoose.Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class MHttpLog {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MHttpLog', default: null })
  parentId: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  target: string;

  @Prop({ type: String, required: true })
  actor: string;

  @Prop({ type: String, required: true })
  method: string;

  @Prop({ type: String, required: true })
  url: string;

  @Prop({ type: Number, required: false, default: null })
  statusCode: number;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  requestHeaders: Record<string, unknown>;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: null })
  requestParams: string | HttpLogReqParams;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: null })
  responseHeaders: Record<string, unknown>;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: false, default: null })
  responseBody: string | Record<string, unknown>;

  @Prop({ type: Date, required: true })
  startAt: Date;

  @Prop({ type: Date, required: false, default: null })
  endAt: Date;

  createdAt: Date;
}

export const mHttpLogSchema: mongoose.Schema<MHttpLogDocument> = SchemaFactory.createForClass(MHttpLog);

export const mHttpLogModelDef: ModelDefinition = { name: MHttpLog.name, schema: mHttpLogSchema };
