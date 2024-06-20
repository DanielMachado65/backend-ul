import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ _id: false })
export class MOwnerOpinionScoreSchema {
  @Prop({ type: Number })
  conforto: number;

  @Prop({ type: Number })
  cambio: number;

  @Prop({ type: Number })
  consumoNaCidade: number;

  @Prop({ type: Number })
  consumoNaEstrada: number;

  @Prop({ type: Number })
  performance: number;

  @Prop({ type: Number })
  dirigibilidade: number;

  @Prop({ type: Number })
  espacoInterno: number;

  @Prop({ type: Number })
  estabilidade: number;

  @Prop({ type: Number })
  freios: number;

  @Prop({ type: Number })
  portaMalas: number;

  @Prop({ type: Number })
  suspensao: number;

  @Prop({ type: Number })
  custoBeneficio: number;

  @Prop({ type: Number })
  totalScore: number;
}

const mOwnerOpinionScoreSchema: mongoose.Schema<MOwnerOpinionScoreSchema & mongoose.Document> =
  SchemaFactory.createForClass(MOwnerOpinionScoreSchema);

@Schema({ _id: false })
export class MOwnerOpinionSchema {
  @Prop({ type: mOwnerOpinionScoreSchema })
  score: MOwnerOpinionScoreSchema;
}

export const mOwnerOpinionSchema: mongoose.Schema<MOwnerOpinionSchema & mongoose.Document> =
  SchemaFactory.createForClass(MOwnerOpinionSchema);
