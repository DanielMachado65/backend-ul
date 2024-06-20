import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MCompanyDocument = MCompany & mongoose.Document;

@Schema({ _id: false })
class MMediaSchema {
  @Prop({ type: String, default: null })
  logo: string;

  @Prop({ type: String, default: null })
  title: string;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: String, default: null })
  url: string;
}

const mMediaSchema: mongoose.Schema<MMediaSchema & mongoose.Document> = SchemaFactory.createForClass(MMediaSchema);

@Schema({ timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' } })
export class MCompany {
  @Prop({ type: [{ type: mMediaSchema }], default: [] })
  medias: ReadonlyArray<MMediaSchema>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MFaq', default: null }] })
  faq: ReadonlyArray<mongoose.Types.ObjectId>;

  createAt: string;
  updateAt: string;
}

export const mCompanySchema: mongoose.Schema<MCompanyDocument> = SchemaFactory.createForClass(MCompany);

export const mCompanyModelDef: ModelDefinition = { name: MCompany.name, schema: mCompanySchema };
