import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
  PaymentFillingOrder,
  PaymentSplittingType,
  allPaymentFillingOrder,
  allPaymentSplittingTypes,
} from 'src/domain/_entity/payment-management.entity';

export type MPaymentsManagementDocument = MPaymentsManagement & mongoose.Document;

@Schema({ _id: false })
export class MPaymentSplittingRule {
  @Prop({ type: String, required: true })
  cnpj: string;

  @Prop({
    type: Number,
    required: function () {
      const parent: MPaymentsManagementDocument = this.parent();
      return parent.splittingType === PaymentSplittingType.ABSOLUTE;
    },
  })
  maxValueCents: number;

  @Prop({
    type: Number,
    required: function () {
      const parent: MPaymentsManagementDocument = this.parent();
      return (
        parent.splittingType === PaymentSplittingType.ABSOLUTE && parent.fillingOrder === PaymentFillingOrder.SEQUENTIAL
      );
    },
  })
  fillOrder: number;

  @Prop({
    type: Number,
    required: function () {
      const parent: MPaymentsManagementDocument = this.parent();
      return parent.splittingType === PaymentSplittingType.PERCENT;
    },
  })
  percent: number;
}

const mPaymentSplittingRule: mongoose.Schema<MPaymentSplittingRule & mongoose.Document> =
  SchemaFactory.createForClass(MPaymentSplittingRule);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class MPaymentsManagement {
  @Prop({ type: String, enum: allPaymentSplittingTypes, required: true })
  splittingType: PaymentSplittingType;

  @Prop({ type: String, enum: allPaymentFillingOrder, required: true })
  fillingOrder: PaymentFillingOrder;

  @Prop({
    type: [{ type: mPaymentSplittingRule }],
    required: true,
    validate: [
      {
        validator: function (value: ReadonlyArray<MPaymentSplittingRule>): boolean {
          return value.length >= 1;
        },
        message: 'At least one rule required',
      },
      {
        validator: function (value: ReadonlyArray<MPaymentSplittingRule>): boolean {
          if (this.splittingType === 'percent') {
            const sum: number = value.reduce(
              (total: number, rule: MPaymentSplittingRule) => total + (rule.percent || 0),
              0,
            );
            return sum === 100;
          }

          return true;
        },
        message: 'The sum of percentages must be equal to 100',
      },
    ],
  })
  rules: ReadonlyArray<MPaymentSplittingRule>;

  createdAt: Date;
}

export const mPaymentsManagementSchema: mongoose.Schema<MPaymentsManagementDocument> =
  SchemaFactory.createForClass(MPaymentsManagement);

export const mPaymentsManagementModelDef: ModelDefinition = {
  name: MPaymentsManagement.name,
  schema: mPaymentsManagementSchema,
};
