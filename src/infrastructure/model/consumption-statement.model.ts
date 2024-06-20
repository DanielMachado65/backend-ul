import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MConsumptionStatementDocument = MConsumptionStatement & mongoose.Document;

// export class MConsumptionStatementCommissionFixedCosts {
//   isFatmin: boolean;
//   isDspac: boolean;
// }
//
// export class MConsumptionStatementCommission {
//   value: number;
//   fixedBaseValue: number;
//   percentage: number;
//   fixedCosts: MConsumptionStatementCommissionFixedCosts;
// }

@Schema()
export class MConsumptionStatement {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MInvoice', default: null })
  invoice: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MBilling', default: null })
  billing: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MQuery', default: null })
  query: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  querycode: number;

  @Prop({ type: String, default: null })
  description: string;

  @Prop({ type: String, default: null })
  tag: string;

  @Prop({ type: Boolean, default: false })
  status: boolean;

  @Prop({ type: Number, default: 0 })
  value: number;

  @Prop({ type: Number, default: 0 })
  range: number;

  @Prop({ type: Number, default: 0 })
  totalConsumptions: number;

  @Prop({ type: Date, default: null })
  payday: Date;
}

export const mConsumptionStatementSchema: mongoose.Schema<MConsumptionStatementDocument> =
  SchemaFactory.createForClass(MConsumptionStatement);

export const mConsumptionStatementModelDef: ModelDefinition = {
  name: MConsumptionStatement.name,
  schema: mConsumptionStatementSchema,
};
