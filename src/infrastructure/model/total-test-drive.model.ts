import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MTotalTestDriveDocument = MTotalTestDrive & mongoose.Document;

@Schema()
export class MTotalTestDrive {
  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Date, required: true })
  createdAt: Date;
}

export const mTotalTestDriveSchema: mongoose.Schema<MTotalTestDriveDocument> =
  SchemaFactory.createForClass(MTotalTestDrive);

export const mTotalTestDriveModelDef: ModelDefinition = { name: MTotalTestDrive.name, schema: mTotalTestDriveSchema };
