import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { PreQueryEntity } from 'src/domain/_entity/pre-query.entity';

import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { PreQueryDto } from 'src/domain/_layer/data/dto/pre-query.dto';
import { StaticDataService } from 'src/domain/_layer/infrastructure/service/static-data.service';
import { BrandImage, VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { GetPreQueryDomain, GetPreQueryIO, PreQueryInputDto } from 'src/domain/core/query/get-pre-query.domain';
import { StringUtil } from 'src/infrastructure/util/string.util';

@Injectable()
export class GetPreQueryUseCase implements GetPreQueryDomain {
  constructor(
    private readonly _staticDataService: StaticDataService,
    private readonly _vehicleImageService: VehicleImageService,
  ) {}

  getPreQuery(input: Partial<PreQueryInputDto>): GetPreQueryIO {
    return EitherIO.from(UnknownDomainError.toFn(), this._makeRequest(input))
      .map(this._doResponse(input))
      .map(this._createBrandImage());
  }

  private _makeRequest(input: Partial<PreQueryInputDto>) {
    return async (): Promise<PreQueryEntity> => {
      return this._staticDataService.getPreQuery(input);
    };
  }

  private _doResponse(input: Partial<PreQueryInputDto>) {
    return (preQuery: PreQueryDto): PreQueryDto => {
      if (input.plate) {
        return {
          ...preQuery,
          plate: input.plate,
          engineNumber: StringUtil.hideValue(preQuery.engineNumber, 2),
          chassis: StringUtil.hideValue(preQuery.chassis, 4),
        };
      } else if (input.chassis) {
        return {
          ...preQuery,
          chassis: input.chassis,
          engineNumber: StringUtil.hideValue(preQuery.engineNumber, 2),
          plate: StringUtil.hideValue(preQuery.plate, 2),
        };
      }

      return {
        ...preQuery,
        engineNumber: input.engineNumber,
        plate: StringUtil.hideValue(preQuery.plate, 2),
        chassis: StringUtil.hideValue(preQuery.chassis, 4),
      };
    };
  }

  private _createBrandImage() {
    return async (preQuery: PreQueryDto): Promise<PreQueryDto> => {
      const brnadImage: BrandImage = await this._vehicleImageService.getImageForBrandName(preQuery.brand);

      return {
        ...preQuery,
        brandImageUrl: brnadImage.mainImageUrl,
      };
    };
  }
}
