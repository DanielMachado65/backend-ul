import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MCityZipCodesDocument = MCityZipCodes & mongoose.Document;

@Schema()
export class MCityZipCodes {
  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  state: string;

  @Prop({ type: String, required: true })
  zipcode: string;
}

export const mCityZipCodesSchema: mongoose.Schema<MCityZipCodesDocument> = SchemaFactory.createForClass(MCityZipCodes);

export const mCityZipCodesModelDef: ModelDefinition = { name: MCityZipCodes.name, schema: mCityZipCodesSchema };
