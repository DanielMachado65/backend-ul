import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { FaqType, faqTypes } from 'src/domain/_entity/faq.entity';

export type MFaqDocument = MFaq & mongoose.Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class MFaq {
  @Prop({ type: String, default: null })
  title: string;

  @Prop({ type: String, default: null })
  answer: string;

  @Prop({ type: String, enum: faqTypes, default: null })
  type: FaqType;

  @Prop({ type: Date, default: null })
  deleteAt: string;

  createAt: string;
  updateAt: string;
}

export const mFaqSchema: mongoose.Schema<MFaqDocument> = SchemaFactory.createForClass(MFaq);

export const mFaqModelDef: ModelDefinition = { name: MFaq.name, schema: mFaqSchema };
