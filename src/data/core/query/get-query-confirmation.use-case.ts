import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';

import { MyCarsQueryHelper } from 'src/data/core/product/my-cars-query.helper';
import { QueryConfirmationVersions } from 'src/domain/_entity/query-confirmation.entity';
import { QueryKeys } from 'src/domain/_entity/query.entity';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryConfirmationDto } from 'src/domain/_layer/data/dto/query-confirmation.dto';
import { QueryResponseDto } from 'src/domain/_layer/data/dto/query-response.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { BrandImage, VehicleImageService } from 'src/domain/_layer/infrastructure/service/vehicle-image.service';
import { GetQueryConfirmationDomain, QueryConfirmationIO } from 'src/domain/core/query/get-query-confirmation.domain';
import { BasicVehicleFipeVo } from 'src/domain/value-object/basic-vechicle.vo';
import { StringUtil } from 'src/infrastructure/util/string.util';

type UserAndKeys = {
  keys: QueryKeys;
  email: string;
  name: string;
};

@Injectable()
export class GetQueryConfirmationUseCase implements GetQueryConfirmationDomain {
  private static readonly TEMPLATE_QUERY: string = '2';

  constructor(
    private readonly _myCarsQueryHelper: MyCarsQueryHelper,
    private readonly _userRepository: UserRepository,
    private readonly _vehicleImageService: VehicleImageService,
  ) {}

  getQueryConfirmation(keys: QueryKeys, userId: string): QueryConfirmationIO {
    return EitherIO.of(UnknownDomainError.toFn(), userId)
      .map(this._getUser())
      .map(this._margeUserAndKeys(keys))
      .map(this._myCarsQueryHelper.requestQuery(GetQueryConfirmationUseCase.TEMPLATE_QUERY))
      .map(this._myCarsQueryHelper.getResponse())
      .map(this._parseResponse(keys))
      .map(this._hideValues(keys));
  }

  private _getUser() {
    return (userId: string): Promise<UserDto> => {
      return this._userRepository.getById(userId);
    };
  }

  private _margeUserAndKeys(keys: QueryKeys) {
    return (user: UserDto): UserAndKeys => {
      return {
        keys: keys,
        email: user.email,
        name: user.name,
      };
    };
  }

  private _parseResponse(keys: QueryKeys) {
    return async ({ response }: QueryResponseDto): Promise<QueryConfirmationDto> => {
      const brand: string = response && response.aggregate && response.aggregate.brand ? response.aggregate.brand : '';
      const brandImage: BrandImage = await this._vehicleImageService.getImageForBrandName(brand);
      const fipeData: ReadonlyArray<BasicVehicleFipeVo> =
        response && response.basicVehicle && response.basicVehicle.fipeData ? response.basicVehicle.fipeData : [];

      const versions: ReadonlyArray<QueryConfirmationVersions> = fipeData.map((info: BasicVehicleFipeVo) => ({
        fipeId: String(info.fipeId),
        name: info.version,
      }));

      return {
        placa: (response && response.aggregate && response.aggregate.plate) || keys.plate,
        chassi: (response && response.aggregate && response.aggregate.chassis) || keys.chassis,
        marcaImagem: brandImage.mainImageUrl ? brandImage.mainImageUrl : undefined,
        marca: response && response.aggregate && response.aggregate.brand,
        modelo: response && response.aggregate && response.aggregate.model,
        versoes: versions,
      };
    };
  }

  private _hideValues(keys: QueryKeys) {
    return (queryConfirmation: QueryConfirmationDto): QueryConfirmationDto => {
      if (keys.plate) {
        return {
          ...queryConfirmation,
          chassi: StringUtil.hideValue(queryConfirmation.chassi, 4),
        };
      }

      return {
        ...queryConfirmation,
        placa: '-',
      };
    };
  }
}
