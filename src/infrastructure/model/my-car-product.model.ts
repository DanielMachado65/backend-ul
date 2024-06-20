import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MyCarProductStatusEnum, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { NotificationChannel, allNotificationChannels } from 'src/domain/_entity/notification.entity';

const statusEnum: ReadonlyArray<string> = ['consumed', 'active', 'deactive', 'excluding', 'excluded'];

export type MMyCarProductDocument = MMyCarProduct & mongoose.Document;

@Schema({ _id: false })
class MRevisionConfig {
  @Prop({ type: Boolean, default: false })
  isEnabled: boolean;

  @Prop({ type: Number, default: 0 })
  mileageKm: number;

  @Prop({ type: Number, default: 0 })
  mileageKmMonthly: number;

  @Prop({ type: [{ type: String }], enum: [...allNotificationChannels], default: [] })
  notificationChannels: ReadonlyArray<NotificationChannel>;

  @Prop({ type: Boolean, default: false })
  shouldNotify7DaysBefore: boolean;

  @Prop({ type: Boolean, default: false })
  shouldNotify15DaysBefore: boolean;

  @Prop({ type: Boolean, default: false })
  shouldNotify30DaysBefore: boolean;
}

const mRevisionConfigSchema: mongoose.Schema<MRevisionConfig & mongoose.Document> =
  SchemaFactory.createForClass(MRevisionConfig);

@Schema({ _id: false })
class MOnQueryConfig {
  @Prop({ type: Boolean, default: false })
  isEnabled: boolean;

  @Prop({ type: [{ type: String }], enum: [...allNotificationChannels], default: [] })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

const mOnQueryConfigSchema: mongoose.Schema<MOnQueryConfig & mongoose.Document> =
  SchemaFactory.createForClass(MOnQueryConfig);

@Schema({ _id: false })
class MPriceFIPEConfig {
  @Prop({ type: Boolean, default: false })
  isEnabled: boolean;

  @Prop({ type: [{ type: String }], enum: [...allNotificationChannels], default: [] })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

const mPriceFIPEConfigSchema: mongoose.Schema<MPriceFIPEConfig & mongoose.Document> =
  SchemaFactory.createForClass(MPriceFIPEConfig);

@Schema({ _id: false })
class MFineConfig {
  @Prop({ type: Boolean, default: false })
  isEnabled: boolean;

  @Prop({ type: [{ type: String }], enum: [...allNotificationChannels], default: [] })
  notificationChannels: ReadonlyArray<NotificationChannel>;
}

const mFineConfigSchema: mongoose.Schema<MFineConfig & mongoose.Document> = SchemaFactory.createForClass(MFineConfig);

@Schema({ _id: false })
export class MMyCarKeys {
  @Prop({ type: String, default: null })
  plate: string;

  @Prop({ type: String, default: null })
  chassis: string;

  @Prop({ type: String, default: null })
  brand: string;

  @Prop({ type: String, default: null })
  model: string;

  @Prop({ type: String, default: null })
  brandModelCode: string;

  @Prop({ type: String, default: null })
  fipeId: string;

  @Prop({ type: String, default: null })
  versionId: string;

  @Prop({ type: String, default: null })
  fipeName: string;

  @Prop({ type: Number, default: null })
  modelYear: number;

  @Prop({ type: String, default: null })
  engineNumber: string;

  @Prop({ type: String, default: null })
  engineCapacity: string;

  @Prop({ type: String, default: null })
  zipCode: string;
}

const mMyCarKeysSchema: mongoose.Schema<MMyCarKeys & mongoose.Document> = SchemaFactory.createForClass(MMyCarKeys);

@Schema({ timestamps: true })
export class MMyCarProduct {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MBilling', required: true })
  billingId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MSubscription', default: null })
  subscriptionId: mongoose.Types.ObjectId;

  @Prop({
    type: String,
    default: 'freemium',
    enum: ['freemium', 'premium'] as readonly MyCarProductTypeEnum[],
    required: true,
  })
  type: MyCarProductTypeEnum;

  @Prop({
    type: String,
    default: 'active',
    enum: statusEnum,
    required: true,
  })
  status: MyCarProductStatusEnum;

  @Prop({ type: Date, default: null })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  deactivatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date;

  @Prop({ type: mRevisionConfigSchema, default: new MRevisionConfig() })
  revisionConfig: MRevisionConfig;

  @Prop({ type: mOnQueryConfigSchema, default: new MOnQueryConfig() })
  onQueryConfig: MOnQueryConfig;

  @Prop({ type: mPriceFIPEConfigSchema, default: new MPriceFIPEConfig() })
  priceFIPEConfig: MPriceFIPEConfig;

  @Prop({ type: mFineConfigSchema, default: new MFineConfig() })
  fineConfig: MFineConfig;

  @Prop({ type: mMyCarKeysSchema, required: true })
  keys: MMyCarKeys;

  createdAt?: Date;
  updatedAt?: Date;
}

export const mMyCarProductSchema: mongoose.Schema<MMyCarProductDocument> = SchemaFactory.createForClass(MMyCarProduct);

export const mMyCarProductModelDef: ModelDefinition = {
  name: MMyCarProduct.name,
  schema: mMyCarProductSchema,
};
