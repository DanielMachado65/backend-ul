import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MQueryMapperDocument = MQueryMapper & mongoose.Document;

@Schema()
export class MQueryMapper {
  createAt: Date;
  queryComposition: MQueryMapper;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  vehicularDataMapping: Record<string, unknown>;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  personDataMapping: Record<string, unknown>;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  personGroupDataMapping: Record<string, unknown>;
}

export const mQueryMapperSchema: mongoose.Schema<MQueryMapperDocument> = SchemaFactory.createForClass(MQueryMapper);

export const mQueryMapperModelDef: ModelDefinition = { name: MQueryMapper.name, schema: mQueryMapperSchema };
