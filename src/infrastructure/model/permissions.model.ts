import { ModelDefinition, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { MUser } from './user.model';

export type MPermissionsDocument = MPermissions & mongoose.Document;

export class MPermissionsViewFeature {
  name: string;
  isBlock: string;
}

export class MPermissionsView {
  state: string;
  isBlock: string;
  features: ReadonlyArray<MPermissionsViewFeature>;
}

@Schema()
export class MPermissions {
  user: MUser;
  views: ReadonlyArray<MPermissionsView>;
}

export const mPermissionsSchema: mongoose.Schema<MPermissionsDocument> = SchemaFactory.createForClass(MPermissions);

export const mPermissionsModelDef: ModelDefinition = { name: MPermissions.name, schema: mPermissionsSchema };
