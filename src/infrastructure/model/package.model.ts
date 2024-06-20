import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MPackageDocument = MPackage & mongoose.Document;

@Schema()
export class MPackage {
  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Number, default: 0.0 })
  purchasePrice: number;

  @Prop({ type: Number, default: 0.0 })
  attributedValue: number;

  @Prop({ type: String, required: true, unique: true, default: null })
  name: string;

  @Prop({ type: Number, default: 0.0 })
  discountPercent: number;
}

export const mPackageSchema: mongoose.Schema<MPackageDocument> = SchemaFactory.createForClass(MPackage);

export const mPackageModelDef: ModelDefinition = { name: MPackage.name, schema: mPackageSchema };
