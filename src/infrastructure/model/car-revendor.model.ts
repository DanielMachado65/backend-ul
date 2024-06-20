import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MCarRevendorDocument = MCarRevendor & mongoose.Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class MCarRevendor {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: Boolean })
  status: boolean;

  createAt: Date;
  updateAt: Date;
}

export const mCarRevendorSchema: mongoose.Schema<MCarRevendorDocument> = SchemaFactory.createForClass(MCarRevendor);

export const mCarRevendorModelDef: ModelDefinition = { name: MCarRevendor.name, schema: mCarRevendorSchema };
