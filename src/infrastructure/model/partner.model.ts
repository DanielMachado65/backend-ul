import { ModelDefinition, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MUser } from './user.model';
import { MQueryComposer } from './query-composer.model';

export type MPartnerDocument = MPartner & mongoose.Document;

export class MPartnerRulesQuery {
  queryComposition: MQueryComposer;
  cost: number;
}

export class MPartnerRulesBillingGateway {
  clientSecret: string;
  clientId: string;
}

export class MPartnerRulesBillingGateways {
  gerenciaNet: MPartnerRulesBillingGateway;
}

export class MPartnerRulesBilling {
  financialLockLimit: number;
  accountFundsLimit: number;
  registerRate: number;
  gateways: MPartnerRulesBillingGateways;
}

export class MPartnerRulesUser {
  hasDisableUsers: boolean;
}

export class MPartnerRulesCoupons {
  discountPercentage: number;
  discountValue: number;
  minValueToApply: number;
  limitUsage: number;
}

export class MPartnerRules {
  queries: ReadonlyArray<MPartnerRulesQuery>;
  billing: MPartnerRulesBilling;
  user: MPartnerRulesUser;
  coupons: MPartnerRulesCoupons;
}

@Schema()
export class MPartner {
  user: MUser;
  partnerType: string;
  percentage: number;
  rules: MPartnerRules;
}

export const mPartnerSchema: mongoose.Schema<MPartnerDocument> = SchemaFactory.createForClass(MPartner);

export const mPartnerModelDef: ModelDefinition = { name: MPartner.name, schema: mPartnerSchema };
