import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ _id: false })
export class MBlogPostSchema {
  @Prop({ type: String, required: true })
  blogUrl: string;
}

const mBlogPostSchema: mongoose.Schema<MBlogPostSchema & mongoose.Document> =
  SchemaFactory.createForClass(MBlogPostSchema);

@Schema({ _id: false })
export class MVideoPostSchema {
  @Prop({ type: String, required: true })
  videoUrl: string;
}

const mVideoPostSchema: mongoose.Schema<MVideoPostSchema & mongoose.Document> =
  SchemaFactory.createForClass(MVideoPostSchema);

@Schema({ _id: false })
export class MVehicleReviewSchema {
  @Prop({ type: Number, required: true })
  codigoMarcaModelo: number;

  @Prop({ type: Number, required: true })
  anoModelo: number;

  @Prop({ type: [{ type: mBlogPostSchema }], default: [] })
  blogPosts: ReadonlyArray<MBlogPostSchema>;

  @Prop({ type: [{ type: mVideoPostSchema }], default: [] })
  videoPosts: ReadonlyArray<MVideoPostSchema>;
}

export const mVehicleReviewSchema: mongoose.Schema<MVehicleReviewSchema & mongoose.Document> =
  SchemaFactory.createForClass(MVehicleReviewSchema);
