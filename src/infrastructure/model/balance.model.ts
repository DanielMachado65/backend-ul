import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MBalanceDocument = MBalance & mongoose.Document;

@Schema({ _id: false })
export class MBalanceAssigner {
  @Prop({ type: Boolean, default: true })
  isSystem: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user?: mongoose.Types.ObjectId;
}

const mBalanceAssignerSchema: mongoose.Schema<MBalanceAssigner & mongoose.Document> =
  SchemaFactory.createForClass(MBalanceAssigner);

@Schema()
export class MBalance {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  user?: mongoose.Types.ObjectId;

  @Prop({ type: mBalanceAssignerSchema, default: new MBalanceAssigner() })
  assigner: MBalanceAssigner;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MConsumptionStatement', default: null })
  consumptionItem?: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPayment', default: null })
  payment?: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Number, default: 0.0 })
  lastBalance: number;

  @Prop({ type: Number, default: 0.0 })
  currentBalance: number;

  @Prop({ type: Number, default: 0.0 })
  attributedValue: number;
}

export const mBalanceSchema: mongoose.Schema<MBalanceDocument> = SchemaFactory.createForClass(MBalance);

export const mBalanceModelDef: ModelDefinition = { name: MBalance.name, schema: mBalanceSchema };
