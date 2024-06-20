import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { queryInfoAvailabilities, QueryInfoAvailability } from 'src/domain/_entity/query-info.entity';

export type MQueryInfoDocument = MQueryInfo & mongoose.Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class MQueryInfo {
  @Prop({ type: String, default: '' })
  image: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: String, enum: queryInfoAvailabilities, default: QueryInfoAvailability.NONE })
  isAvailable: QueryInfoAvailability;

  @Prop({ type: String, enum: queryInfoAvailabilities, default: QueryInfoAvailability.NONE })
  isAvailableToOthers: QueryInfoAvailability;

  @Prop({ type: Date, default: null })
  deleteAt: string;

  createAt: string;
  updateAt: string;
}

export const mQueryInfoSchema: mongoose.Schema<MQueryInfoDocument> = SchemaFactory.createForClass(MQueryInfo);

export const mQueryInfoModelDef: ModelDefinition = { name: MQueryInfo.name, schema: mQueryInfoSchema };
