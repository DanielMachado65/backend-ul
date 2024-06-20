import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MTestimonialDocument = MTestimonial & mongoose.Document;

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class MTestimonial {
  @Prop({ type: String, default: null })
  authorName: string;

  @Prop({ type: String, default: '' })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: null })
  deleteAt: string;

  createAt: string;
  updateAt: string;
}

export const mTestimonialSchema: mongoose.Schema<MTestimonialDocument> = SchemaFactory.createForClass(MTestimonial);

export const mTestimonialModelDef: ModelDefinition = { name: MTestimonial.name, schema: mTestimonialSchema };
