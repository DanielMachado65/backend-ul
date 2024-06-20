import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MPriceTableDocument = MPriceTable & mongoose.Document;

// export class MPriceTableTemplateConsumptionRange {
//   rangeStart: number;
//   price: number;
// }

@Schema({ _id: false })
export class MPriceTableTemplate {
  @Prop({ type: Number, required: true })
  querycode: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQueryComposer', default: null })
  queryComposer?: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 0.0 })
  marketingPrice?: number;

  @Prop({ type: Number, default: 0.0 })
  totalPrice: number;

  @Prop({ type: Number, default: 0.0 })
  oldPrice: number;
}

const mPriceTableTemplateSchema: mongoose.Schema<MPriceTableTemplate & mongoose.Document> =
  SchemaFactory.createForClass(MPriceTableTemplate);

@Schema()
export class MPriceTable {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  creator?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPlan', default: null })
  plan?: mongoose.Types.ObjectId;

  @Prop({ type: [{ type: mPriceTableTemplateSchema }], default: [] })
  template: ReadonlyArray<MPriceTableTemplate>;
}

export const mPriceTableSchema: mongoose.Schema<MPriceTableDocument> = SchemaFactory.createForClass(MPriceTable);

export const mPriceTableModelDef: ModelDefinition = { name: MPriceTable.name, schema: mPriceTableSchema };
