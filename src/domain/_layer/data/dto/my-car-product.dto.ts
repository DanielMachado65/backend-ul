import {
  FineConfig,
  MyCarKeys,
  MyCarProductEntity,
  MyCarProductStatusEnum,
  MyCarProductTypeEnum,
  OnQueryConfig,
  PriceFIPEConfig,
  RevisionConfig,
} from 'src/domain/_entity/my-car-product.entity';

export type MyCarProductDto = MyCarProductEntity;

export type MyCarProductWithUserDto = {
  readonly userId: string;
  readonly billingId?: string;
  readonly carId: string;
  readonly email: string;
  readonly name: string;
  readonly userUF: string;
  readonly status: MyCarProductStatusEnum;
  readonly keys: MyCarKeys | null;
  readonly type: MyCarProductTypeEnum;
  readonly onQueryConfig: OnQueryConfig | null;
  readonly revisionConfig: RevisionConfig | null;
  readonly fineConfig: FineConfig | null;
  readonly priceFIPEConfig: PriceFIPEConfig | null;
};
