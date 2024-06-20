import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { allServicePriorities, ServicePriority } from '../../domain/_entity/service.entity';

export type MServiceDocument = MService & mongoose.Document;

@Schema({ _id: false })
export class MServiceSupplier {
  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Number, default: 0 })
  supplierCode: number;
}

const mServiceSupplierSchema: mongoose.Schema<MServiceSupplier & mongoose.Document> =
  SchemaFactory.createForClass(MServiceSupplier);

@Schema({ _id: false })
export class MServiceSwitching {
  @Prop({ type: Number, default: 0 })
  supplier: number;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'MService', default: null })
  service: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: ServicePriority.VERY_LOW, enum: allServicePriorities })
  priority: number;
}

const mServiceSwitchingSchema: mongoose.Schema<MServiceSwitching & mongoose.Document> =
  SchemaFactory.createForClass(MServiceSwitching);

@Schema()
export class MService {
  @Prop({ type: Date, default: Date.now })
  createAt: Date;

  @Prop({ type: Boolean, default: true })
  status: boolean;

  @Prop({ type: Number, required: true, unique: true })
  code: number;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: mServiceSupplierSchema, default: new MServiceSupplier() })
  supplier: MServiceSupplier;

  @Prop({ type: Boolean, default: false })
  hasAutoSwitching: boolean;

  @Prop({ type: [{ type: mServiceSwitchingSchema }], default: [] })
  switching: ReadonlyArray<MServiceSwitching>;

  @Prop({ type: Number, default: 0.0 })
  minimumPrice: number;
}

export const mServiceSchema: mongoose.Schema<MServiceDocument> = SchemaFactory.createForClass(MService);

export const mServiceModelDef: ModelDefinition = { name: MService.name, schema: mServiceSchema };
