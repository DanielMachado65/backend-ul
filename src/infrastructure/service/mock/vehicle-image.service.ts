import {
  BrandImage,
  ModelImage,
  VehicleImageService,
} from 'src/domain/_layer/infrastructure/service/vehicle-image.service';

export class VehicleImageMockService implements VehicleImageService {
  getImageForModelCode(_brandCode: string): Promise<ModelImage> {
    throw new Error('Method not implemented.');
  }

  getImageForBrandName(_brandName: string): Promise<BrandImage> {
    throw new Error('Method not implemented.');
  }
}
