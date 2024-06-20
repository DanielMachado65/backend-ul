import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { QueryComposerType, allQueryComposerType } from '../../domain/_entity/query-composer.entity';

export type MQueryComposerDocument = MQueryComposer & mongoose.Document;

@Schema()
export class MQueryComposer {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Number, required: true, unique: true })
  queryCode: number;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: String, default: QueryComposerType.VEHICULAR, enum: allQueryComposerType })
  type: string;

  @Prop({ type: Boolean, default: false })
  isRecommended: boolean;

  @Prop({ type: Boolean, default: false })
  isNewFeature: boolean;

  @Prop({ type: Boolean, default: false })
  showInComparisonTable: boolean;

  @Prop({ type: String, default: '' })
  fullDescription: string;

  @Prop({ type: String, default: '' })
  shortDescription: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MFaq' }] })
  faq: ReadonlyArray<mongoose.Types.ObjectId>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MQueryInfo' }] })
  queryInfos: ReadonlyArray<mongoose.Types.ObjectId>;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MTestimonial' }] })
  testimonials: ReadonlyArray<mongoose.Types.ObjectId>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQuery', default: null })
  exampleQuery: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MService' }] })
  services: ReadonlyArray<mongoose.Types.ObjectId>;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQueryMapper', default: null })
  queryMap: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQueryRules', default: null })
  queryRules: mongoose.Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  buyable: boolean;

  @Prop({ type: Boolean })
  canBeTestDrive: boolean;
}

export const mQueryComposerSchema: mongoose.Schema<MQueryComposerDocument> =
  SchemaFactory.createForClass(MQueryComposer);

export const mQueryComposerModelDef: ModelDefinition = { name: MQueryComposer.name, schema: mQueryComposerSchema };
