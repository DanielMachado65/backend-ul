import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, Observable } from 'rxjs';
import {
  VehicleVersion,
  VehicleVersionService,
  VersionAbout,
} from 'src/domain/_layer/infrastructure/service/vehicle-version.service';
import { EnvService, ENV_KEYS } from '../framework/env.service';

@Injectable()
export class FipeApiService implements VehicleVersionService {
  private readonly _baseUrl: string;

  constructor(private readonly _httpService: HttpService, private readonly _envService: EnvService) {
    this._baseUrl = _envService.get(ENV_KEYS.FIPE_API_BASE_URL);
  }

  async getBrands(): Promise<ReadonlyArray<string>> {
    const $brands: Observable<AxiosResponse<ReadonlyArray<string>>> = await this._httpService.get(
      this._baseUrl + '/vehicle/brands',
    );
    const brands: AxiosResponse<ReadonlyArray<string>> = await firstValueFrom($brands);
    return brands.data;
  }

  async getModels(brand: string): Promise<ReadonlyArray<string>> {
    const $models: Observable<AxiosResponse<ReadonlyArray<string>>> = await this._httpService.get(
      this._baseUrl + `/vehicle/brand/${encodeURIComponent(brand)}/models`,
    );
    const models: AxiosResponse<ReadonlyArray<string>> = await firstValueFrom($models);
    if (typeof models.data === 'string') throw new Error('is not json');
    return models.data;
  }

  async getModelYears(brand: string, model: string): Promise<ReadonlyArray<number>> {
    const $modelYears: Observable<AxiosResponse<ReadonlyArray<number>>> = await this._httpService.get(
      this._baseUrl + `/vehicle/brand/${encodeURIComponent(brand)}/model/${encodeURIComponent(model)}/model-years`,
    );
    const modelYears: AxiosResponse<ReadonlyArray<number>> = await firstValueFrom($modelYears);
    if (typeof modelYears.data === 'string') throw new Error('is not json');
    return modelYears.data;
  }

  async getVersions(brand: string, model: string, year: number): Promise<ReadonlyArray<VehicleVersion>> {
    const $versions: Observable<AxiosResponse<ReadonlyArray<VehicleVersion>>> = await this._httpService.get(
      this._baseUrl +
        `/vehicle/brand/${encodeURIComponent(brand)}/model/${encodeURIComponent(model)}/model-year/${encodeURIComponent(
          year,
        )}/versions`,
    );
    const versions: AxiosResponse<ReadonlyArray<VehicleVersion>> = await firstValueFrom($versions);
    if (typeof versions.data === 'string') throw new Error('is not json');
    return versions.data;
  }

  async getVersionAbout(fipeId: string, modelYear: number): Promise<VersionAbout> {
    const $about: Observable<AxiosResponse<VersionAbout>> = await this._httpService.get(
      this._baseUrl + `/vehicle/version/${encodeURIComponent(fipeId)}/about?year=${encodeURIComponent(modelYear)}`,
    );
    const about: AxiosResponse<VersionAbout> = await firstValueFrom($about);
    if (typeof about.data === 'string') return null;
    return about.data;
  }

  async getMultipleVersionAbout(fipeIds: readonly string[], modelYear: number): Promise<readonly VersionAbout[]> {
    const $about: Observable<AxiosResponse<ReadonlyArray<VersionAbout>>> = await this._httpService.get(
      this._baseUrl +
        `/vehicle/version/about?fipeIds=${encodeURIComponent(fipeIds.join(','))}&year=${encodeURIComponent(modelYear)}`,
    );
    const about: AxiosResponse<ReadonlyArray<VersionAbout>> = await firstValueFrom($about);
    return about.data;
  }

  /**
   * This returns a very large list! Potential DOS vector
   * IMPROV: Maybe this should be a stream and the payload should be binary
   */
  async getAllPossibleVehicles(): Promise<ReadonlyArray<VersionAbout>> {
    const $all: Observable<AxiosResponse<ReadonlyArray<VersionAbout>>> = await this._httpService.get(
      this._baseUrl + '/vehicle/all',
    );
    const all: AxiosResponse<ReadonlyArray<VersionAbout>> = await firstValueFrom($all);
    return all.data;
  }
}
