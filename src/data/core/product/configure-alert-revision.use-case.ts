import { Injectable } from '@nestjs/common';
import { MyCarProductEntity, RevisionConfig } from 'src/domain/_entity/my-car-product.entity';
import { ConfigureAlertRevisionDto } from 'src/domain/core/product/configure-alert-revision.domain';
import { BaseConfigureAlertUseCase } from './base-alert.use-case';

@Injectable()
export class ConfigureAlertRevisionUseCase extends BaseConfigureAlertUseCase<
  MyCarProductEntity,
  ConfigureAlertRevisionDto
> {
  protected override _makeResponse(myCarProduct: MyCarProductEntity): ConfigureAlertRevisionDto {
    return {
      isEnabled: myCarProduct.revisionConfig.isEnabled,
      notificationChannels: myCarProduct.revisionConfig.notificationChannels,
      notificationConfig: {
        shouldNotify7DaysBefore: myCarProduct.revisionConfig.shouldNotify7DaysBefore,
        shouldNotify15DaysBefore: myCarProduct.revisionConfig.shouldNotify15DaysBefore,
        shouldNotify30DaysBefore: myCarProduct.revisionConfig.shouldNotify30DaysBefore,
      },
      vehicle: {
        mileageKm: myCarProduct.revisionConfig.mileageKm,
        mileageKmMonthly: myCarProduct.revisionConfig.mileageKmMonthly,
      },
    };
  }

  protected override async _updateConfig(
    carId: string,
    config: ConfigureAlertRevisionDto,
  ): Promise<MyCarProductEntity> {
    const revisionConfig: RevisionConfig = {
      mileageKm: config.vehicle.mileageKm,
      mileageKmMonthly: config.vehicle.mileageKmMonthly,
      shouldNotify7DaysBefore: config.notificationConfig.shouldNotify7DaysBefore,
      shouldNotify15DaysBefore: config.notificationConfig.shouldNotify15DaysBefore,
      shouldNotify30DaysBefore: config.notificationConfig.shouldNotify30DaysBefore,
      isEnabled: config.isEnabled,
      notificationChannels: config.notificationChannels,
    };

    return await this._myCarProductRepository.updateById(carId, {
      revisionConfig,
    });
  }
}
