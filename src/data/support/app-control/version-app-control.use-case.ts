import { EitherIO } from '@alissonfpmorais/minimal_fp';
import { Injectable } from '@nestjs/common';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import {
  VersionAppContolResponseDto,
  VersionAppControlDto,
  VersionAppControlInputDto,
} from 'src/domain/_layer/data/dto/version-app-control.dto';

import { VersionAppControlRepository } from 'src/domain/_layer/infrastructure/repository/version-app-control';
import { VersionAppContolDomain, VersionAppContolIO } from 'src/domain/support/app-control/version-app-control.domain';

@Injectable()
export class VersionAppContolUseCase implements VersionAppContolDomain {
  constructor(private readonly _versionAppControlRepository: VersionAppControlRepository) {}

  validate(input: VersionAppControlInputDto): VersionAppContolIO {
    return EitherIO.of(UnknownDomainError.toFn(), input)
      .map(this._findDevice())
      .map(this._validateVersion(input))
      .map(this._buildResponse());
  }

  private _findDevice() {
    return async (input: VersionAppControlInputDto): Promise<VersionAppControlDto> => {
      const operatingSystem: string = input.operatingSystem?.toLowerCase().trim();
      return await this._versionAppControlRepository.getByDeviceType(operatingSystem);
    };
  }

  private _validateVersion(input: VersionAppControlInputDto) {
    return (versionAppControlDto: VersionAppControlDto): boolean => {
      if (versionAppControlDto === null) return false;

      const deviceVersion: string = input.currentAppVersion;
      const appVersion: string = versionAppControlDto.currentVersion;
      return deviceVersion < appVersion;
    };
  }

  private _buildResponse() {
    return (isForceUpgrade: boolean): VersionAppContolResponseDto => {
      return {
        isForceUpgrade,
      };
    };
  }
}
