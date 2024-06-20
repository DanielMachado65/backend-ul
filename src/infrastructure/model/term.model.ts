import { ModelDefinition, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MTermDocument = MTerm & mongoose.Document;

@Schema()
export class MTerm {
  title: string;
  status: boolean;
  version: number;
  body: string;
  createAt: Date;
}

export const mTermSchema: mongoose.Schema<MTermDocument> = SchemaFactory.createForClass(MTerm);

export const mTermModelDef: ModelDefinition = { name: MTerm.name, schema: mTermSchema };
