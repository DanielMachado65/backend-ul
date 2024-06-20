import { VersionAppControlEntity, VersionAppControlInputEntity } from 'src/domain/_entity/version-app.control.entity';

export type VersionAppContolResponseDto = {
  readonly isForceUpgrade: boolean;
};

export type VersionAppControlDto = VersionAppControlEntity;

export type VersionAppControlInputDto = VersionAppControlInputEntity;
