import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { userCreationOrigins, userTypes } from '../../domain/_entity/user.entity';

export type MUserDocument = MUser & mongoose.Document;

// export class MUserSocialNetwork {
//   id: string;
//   token: string;
//   name: string;
//   email: string;
// }

// export class MUserSecurity {
//   whitelist: ReadonlyArray<string>;
//   blacklist: ReadonlyArray<string>;
// }

// export class MUserGeneralDataBillingOwner {
//   name: string;
//   phoneNumber: string;
//   email: string;
// }

@Schema({ _id: false })
export class MUserGeneralDataAddress {
  @Prop({ type: String, default: null })
  zipcode?: string;

  @Prop({ type: String, default: null })
  city?: string;

  @Prop({ type: String, default: null })
  state?: string;

  @Prop({ type: String, default: null })
  neighborhood?: string;

  @Prop({ type: String, default: null })
  street?: string;

  @Prop({ type: String, default: null })
  complement?: string;

  @Prop({ type: String, default: null })
  number?: string;
}

const mUserGeneralDataAddressSchema: mongoose.Schema<MUserGeneralDataAddress & mongoose.Document> =
  SchemaFactory.createForClass(MUserGeneralDataAddress);

@Schema({ _id: false })
export class MUserGeneralData {
  // billingOwner: MUserGeneralDataBillingOwner;

  @Prop({ type: mUserGeneralDataAddressSchema, default: new MUserGeneralDataAddress() })
  address: MUserGeneralDataAddress;

  @Prop({ type: String, default: null })
  phoneNumber1?: string;

  @Prop({ type: String, default: null })
  phoneNumber2?: string;

  // birthDate: string;
}

const mUserGeneralDataSchema: mongoose.Schema<MUserGeneralData & mongoose.Document> =
  SchemaFactory.createForClass(MUserGeneralData);

@Schema({ _id: false })
export class MUserCompany {
  @Prop({ type: String, default: null })
  cnpj: string;

  @Prop({ type: String, default: null })
  socialName: string;

  @Prop({ type: String, default: null })
  fantasyName: string;

  @Prop({ type: String, default: null })
  codigoCnae: string;

  @Prop({ type: String, default: null })
  stateSubscription: string;

  @Prop({ type: Boolean, default: false })
  simplesNacional: boolean;

  @Prop({ type: String, default: null })
  codigoNaturezaJuridica: string;
}

const mUserCompanySchema: mongoose.Schema<MUserCompany & mongoose.Document> =
  SchemaFactory.createForClass(MUserCompany);

@Schema({ _id: false })
export class MUserHierarchy {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  owner: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  partner: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MUser', default: null })
  indicator: mongoose.Types.ObjectId;
}

const mUserHierarchySchema: mongoose.Schema<MUserHierarchy & mongoose.Document> =
  SchemaFactory.createForClass(MUserHierarchy);

// export class MUserDocumentData {
//   name: string;
//   link: string;
// }
//
// export class MUserConditions {
//   term: MTerm;
//   agree: boolean;
//   date: Date;
// }
//
// export class MUserCancellationQuiz {
//   reason: string;
//   anotherReason: string;
//   message: string;
//   createAt: Date;
//   debtorClient: boolean;
// }

// export class MUserAfterSaleInfo {
//   operator: MUser;
//   message: string;
//   date: Date;
// }

// export class MUserAfterSale {
//   infos: ReadonlyArray<MUserAfterSaleInfo>;
// }

@Schema({ _id: false })
export class MUserExternalControlsGateway {
  @Prop({ type: String, default: null })
  id: string;
}

const mUserExternalControlsGatewaySchema: mongoose.Schema<MUserExternalControlsGateway & mongoose.Document> =
  SchemaFactory.createForClass(MUserExternalControlsGateway);

@Schema({ _id: false })
export class MUserExternalArcTenantControlsGateway {
  @Prop({ type: String, default: null })
  id: string;

  @Prop({ type: String, default: null })
  cnpj: string;
}

const mUserExternalArcTenantControlsGatewaySchema: mongoose.Schema<
  MUserExternalArcTenantControlsGateway & mongoose.Document
> = SchemaFactory.createForClass(MUserExternalArcTenantControlsGateway);

@Schema({ _id: false })
export class MUserExternalArcControlsGateway {
  /**
   * @deprecated - Should use tenants field instead
   */
  @Prop({ type: String, default: null })
  id: string;

  @Prop({ type: [{ type: mUserExternalArcTenantControlsGatewaySchema }], default: [] })
  tenants: ReadonlyArray<MUserExternalArcTenantControlsGateway>;
}

const mUserExternalArcControlsGatewaySchema: mongoose.Schema<MUserExternalArcControlsGateway & mongoose.Document> =
  SchemaFactory.createForClass(MUserExternalArcControlsGateway);

@Schema({ _id: false })
export class MUserExternalControls {
  @Prop({ type: mUserExternalControlsGatewaySchema, default: new MUserExternalControlsGateway() })
  asaas: MUserExternalControlsGateway;

  @Prop({ type: mUserExternalControlsGatewaySchema, default: new MUserExternalControlsGateway() })
  iugu: MUserExternalControlsGateway;

  @Prop({ type: mUserExternalArcControlsGatewaySchema, default: new MUserExternalArcControlsGateway() })
  arc: MUserExternalArcControlsGateway;
}

const mUserExternalControlsSchema: mongoose.Schema<MUserExternalControls & mongoose.Document> =
  SchemaFactory.createForClass(MUserExternalControls);

@Schema()
export class MUser {
  // siteAdm: boolean;

  // accessCode: string;

  @Prop()
  email: string;

  @Prop({ type: String, required: true })
  cpf: string;

  @Prop({ type: String, required: true })
  pass: string;

  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MBilling', default: null })
  billing?: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: true, enum: userTypes })
  type: number;

  @Prop({ type: Date, default: Date.now })
  lastLogin: Date;

  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  // picture: string;

  @Prop({ type: String, required: true, enum: userCreationOrigins })
  creationOrigin: string;

  // facebook: MUserSocialNetwork;

  // google: MUserSocialNetwork;

  // security: MUserSecurity;

  @Prop({ type: mUserGeneralDataSchema, default: new MUserGeneralData() })
  generalData: MUserGeneralData;

  @Prop({ type: mUserCompanySchema, default: new MUserCompany() })
  company: MUserCompany;

  @Prop({ type: mUserHierarchySchema, default: new MUserHierarchy() })
  hierarchy: MUserHierarchy;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MPartner', default: null })
  partner: mongoose.Types.ObjectId;

  // permissions: MPermissions;

  // documents: ReadonlyArray<MUserDocumentData>;

  // conditions: MUserConditions;

  // cancellationQuiz: MUserCancellationQuiz;

  // afterSales: MUserAfterSale;

  @Prop({ type: mUserExternalControlsSchema, default: new MUserExternalControls() })
  externalControls: MUserExternalControls;

  @Prop({ type: Date, default: null })
  whenDeleteAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: Boolean, default: false })
  isEligibleForMigration: boolean;

  @Prop({ type: Boolean, default: false })
  needsPasswordUpdate?: boolean;

  @Prop({ type: Array<string>, default: [] })
  webhookUrls: string[];
}

export const mUserSchema: mongoose.Schema<MUserDocument> = SchemaFactory.createForClass(MUser);

export const mUserModelDef: ModelDefinition = { name: MUser.name, schema: mUserSchema };
