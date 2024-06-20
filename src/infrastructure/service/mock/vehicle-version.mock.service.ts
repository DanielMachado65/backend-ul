import {
  VehicleVersion,
  VehicleVersionService,
  VersionAbout,
} from 'src/domain/_layer/infrastructure/service/vehicle-version.service';

export class VehicleVersionMockService implements VehicleVersionService {
  getBrands(): Promise<readonly string[]> {
    throw new Error('Method not implemented.');
  }

  getModels(_brand: string): Promise<readonly string[]> {
    throw new Error('Method not implemented.');
  }

  getModelYears(_brand: string, _model: string): Promise<readonly number[]> {
    throw new Error('Method not implemented.');
  }

  getVersions(_brand: string, _model: string, _year: number): Promise<readonly VehicleVersion[]> {
    throw new Error('Method not implemented.');
  }

  getVersionAbout(_fipeId: string, _modelYear: number): Promise<VersionAbout> {
    throw new Error('Method not implemented.');
  }

  getMultipleVersionAbout(_fipeIds: readonly string[], _modelYear: number): Promise<readonly VersionAbout[]> {
    throw new Error('Method not implemented.');
  }

  getAllPossibleVehicles(): Promise<readonly VersionAbout[]> {
    throw new Error('Method not implemented.');
  }
}
