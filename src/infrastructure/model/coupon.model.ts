import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type MCouponDocument = MCoupon & mongoose.Document;

@Schema({ _id: false })
export class MCouponRulesAuthorizedQuery {
  @Prop({ type: Number, required: true })
  code: number;

  @Prop({ type: Number, required: true })
  limit: number;
}

const mCouponRulesAuthorizedQuery: mongoose.Schema<MCouponRulesAuthorizedQuery & mongoose.Document> =
  SchemaFactory.createForClass(MCouponRulesAuthorizedQuery);

@Schema({ _id: false })
export class MCouponRulesAuthorizedPackage {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPackage', default: null })
  packageid: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  limit: number;
}

const mCouponRulesAuthorizedPackage: mongoose.Schema<MCouponRulesAuthorizedPackage & mongoose.Document> =
  SchemaFactory.createForClass(MCouponRulesAuthorizedPackage);

@Schema({ _id: false })
export class MCouponRulesAuthorizedSignature {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPlan', default: null })
  code: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true })
  limit: number;
}

const mCouponRulesAuthorizedSignature: mongoose.Schema<MCouponRulesAuthorizedSignature & mongoose.Document> =
  SchemaFactory.createForClass(MCouponRulesAuthorizedSignature);

@Schema({ _id: false })
export class MCouponRulesAuthorized {
  @Prop({ type: [{ type: mCouponRulesAuthorizedQuery }], required: true, default: [] })
  queries: ReadonlyArray<MCouponRulesAuthorizedQuery>;

  @Prop({ type: [{ type: mCouponRulesAuthorizedPackage }], required: true, default: [] })
  packages: ReadonlyArray<MCouponRulesAuthorizedPackage>;

  @Prop({ type: [{ type: mCouponRulesAuthorizedSignature }], required: true, default: [] })
  signatures: ReadonlyArray<MCouponRulesAuthorizedSignature>;
}

const mCouponRulesAuthorized: mongoose.Schema<MCouponRulesAuthorized & mongoose.Document> =
  SchemaFactory.createForClass(MCouponRulesAuthorized);

@Schema({ _id: false })
export class MCouponRules {
  @Prop({ type: Number, required: true })
  discountPercentage: number;

  @Prop({ type: Number, required: true })
  discountValue: number;

  @Prop({ type: Number, required: true })
  minValueToApply: number;

  @Prop({ type: Date, required: false })
  expirationDate: Date;

  @Prop({ type: Number, required: true })
  limitUsage: number;

  @Prop({ type: Number, required: true })
  usageMaxToUser: number;

  @Prop({ type: mCouponRulesAuthorized, required: true, default: new MCouponRulesAuthorized() })
  authorized: MCouponRulesAuthorized;
}

const mCouponRules: mongoose.Schema<MCouponRules & mongoose.Document> = SchemaFactory.createForClass(MCouponRules);

@Schema()
export class MCoupon {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  creator: mongoose.Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Boolean, required: true })
  status: boolean;

  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  generator?: mongoose.Types.ObjectId;

  @Prop({ type: mCouponRules, required: true })
  rules: MCouponRules;
}

export const mCouponSchema: mongoose.Schema<MCouponDocument> = SchemaFactory.createForClass(MCoupon);

export const mCouponModelDef: ModelDefinition = {
  name: MCoupon.name,
  schema: mCouponSchema,
};
