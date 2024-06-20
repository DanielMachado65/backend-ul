import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MAnalyticsDocument = MAnalytics & mongoose.Document;

@Schema({ timestamps: true })
export class MAnalytics {
  @Prop({ type: String, default: null })
  email: string;

  @Prop({ type: String, default: null })
  link: string;

  @Prop({ type: String, default: null })
  placa: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQuery', default: null })
  queryId: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const mAnalyticsSchema: mongoose.Schema<MAnalyticsDocument> = SchemaFactory.createForClass(MAnalytics);

export const mAnalyticsModelDef: ModelDefinition = { name: MAnalytics.name, schema: mAnalyticsSchema };
