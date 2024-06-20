import { VehicleEntity } from 'src/domain/_entity/vehicle.entity';

export type OwnerReviewModel = {
  readonly vehicle: Partial<VehicleEntity>;
};

export abstract class OwnerReviewModelRepository {
  abstract insertModel(
    fipeId: string | number,
    modelYear: number,
    queryResult: OwnerReviewModel,
  ): Promise<OwnerReviewModel>;

  abstract getModel(fipeId: string | number, modelYear: number): Promise<OwnerReviewModel | null>;
}
