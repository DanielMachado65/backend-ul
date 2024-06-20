import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { allNfeStatus, NfeStatus } from '../../domain/_entity/nfe.entity';

export type MNfeDocument = MNfe & mongoose.Document;

@Schema({ timestamps: true })
export class MNfe {
  @Prop({ type: String, required: true, enum: allNfeStatus, default: NfeStatus.HOPE_FOR_AUTHORIZATION })
  status: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: String, default: null })
  xmlLink?: string;

  @Prop({ type: String, default: null })
  pdfLink?: string;

  @Prop({ type: mongoose.Schema.Types.Decimal128, default: 0.0 })
  value: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPayment', default: null })
  payment?: mongoose.Types.ObjectId;

  @Prop({ type: String, default: null })
  externalNfeId?: string;

  @Prop({ type: String, default: null })
  cnpj: string;

  @Prop({ type: Boolean, default: false })
  isManuallyGenerated: boolean;

  @Prop({ type: String, default: null })
  number: string;

  @Prop({ type: String, default: null })
  confirmationNumber: string;
}

export const mNfeSchema: mongoose.Schema<MNfeDocument> = SchemaFactory.createForClass(MNfe);

export const mNfeModelDef: ModelDefinition = { name: MNfe.name, schema: mNfeSchema };
