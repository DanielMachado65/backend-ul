import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { DeviceTypeVersionAppControl } from 'src/domain/_entity/version-app.control.entity';

@Schema()
export class MVersionAppControl {
  @Prop({ type: String, required: true })
  currentVersion: string;

  @Prop({ type: String, enum: DeviceTypeVersionAppControl })
  deviceType: DeviceTypeVersionAppControl;
}

export type MVersionAppControlDocument = MVersionAppControl & mongoose.Document;

export const mVersionAppControlSchema: mongoose.Schema<MVersionAppControlDocument> =
  SchemaFactory.createForClass(MVersionAppControl);

export const mVersionAppControlDef: ModelDefinition = {
  name: MVersionAppControl.name,
  schema: mVersionAppControlSchema,
};
