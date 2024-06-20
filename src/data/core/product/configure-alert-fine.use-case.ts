import { Injectable } from '@nestjs/common';
import { MyCarProductEntity } from 'src/domain/_entity/my-car-product.entity';
import { BaseConfigureAlertUseCase } from './base-alert.use-case';
import { ConfigureAlertFineDto } from 'src/domain/core/product/configure-alert-fine.domain';

@Injectable()
export class ConfigureAlertFineUseCase extends BaseConfigureAlertUseCase<MyCarProductEntity, ConfigureAlertFineDto> {
  protected override _makeResponse(myCarProduct: MyCarProductEntity): ConfigureAlertFineDto {
    return {
      isEnabled: myCarProduct.fineConfig.isEnabled,
      notificationChannels: myCarProduct.fineConfig.notificationChannels,
    };
  }

  protected override async _updateConfig(
    carId: string,
    fineConfig: ConfigureAlertFineDto,
  ): Promise<MyCarProductEntity> {
    return await this._myCarProductRepository.updateById(carId, {
      fineConfig: {
        isEnabled: fineConfig.isEnabled,
        notificationChannels: fineConfig.notificationChannels,
      },
    });
  }
}
