import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { DateTimeUtil } from 'src/infrastructure/util/date-time-util.service';
import {
  TestDriveQueryDocumentType,
  TestDriveQueryFailedService,
  TestDriveQueryStackResultService,
} from '../../../domain/_entity/test-drive-query.entity';
import { TestDriveQueryDto } from '../../../domain/_layer/data/dto/test-drive-query.dto';
import { TestDriveQueryRepository } from '../../../domain/_layer/infrastructure/repository/test-drive-query.repository';
import {
  MTestDriveQuery,
  MTestDriveQueryDocument,
  MTestDriveQueryFailedService,
  MTestDriveQueryStackResultService,
} from '../../model/test-drive-query.model';
import { MongoBaseRepository, WithId } from '../mongo.repository';

@Injectable()
export class TestDriveQueryMongoRepository
  extends MongoBaseRepository<TestDriveQueryDto, MTestDriveQuery>
  implements TestDriveQueryRepository<ClientSession>
{
  constructor(
    @InjectModel(MTestDriveQuery.name) readonly model: Model<MTestDriveQueryDocument>,
    private readonly _dateTimeUtil: DateTimeUtil,
  ) {
    super();
    this.model = model;
  }

  fromDtoToSchema(dto: Partial<TestDriveQueryDto>): Partial<MTestDriveQuery> {
    return {
      createAt: dto.createdAt && new Date(dto.createdAt),
      user: this.parseStringToObjectId(dto.userId),
      documentQuery: dto.documentQuery,
      documentType: dto.documentType,
      executionTime: dto.executionTime?.toString(),
      keys: dto.queryKeys && {
        placa: dto.queryKeys.plate,
        uf: dto.queryKeys.state,
      },
      refClass: dto.refClass,
      responseJSON: dto.responseJson,
      stackResult: dto.stackResult?.map((service: TestDriveQueryStackResultService) => ({
        rawData: service.rawData,
        serviceLog: this.parseStringToObjectId(service.serviceLogId),
        serviceCode: service.serviceCode,
        dataFound: service.dataFound,
        hasError: service.hasError,
        supplierCode: service.supplierCode,
      })),
      failedServices: dto.failedServices?.map((service: TestDriveQueryFailedService) => ({
        serviceLog: this.parseStringToObjectId(service.serviceLogId),
        serviceCode: service.serviceCode,
        serviceName: service.serviceName,
        supplierCode: service.supplierCode,
      })),
      queryStatus: dto.queryStatus,
      servicesToReprocess: dto.servicesToReprocess,
      status: dto.status,
      code: dto.queryCode,
      log: dto.logError && {
        error: dto.logError,
      },
      userActions: dto.userActions && {
        chosenFipeId: dto.userActions.chosenFipeId,
        chosenVersion: dto.userActions.chosenVersion,
      },
      control: dto.control && {
        requestIp: dto.control.requestIp,
      },
    };
  }

  fromSchemaToDto(schema: WithId<MTestDriveQuery>): TestDriveQueryDto {
    // const executionTime: number | null = !isNaN(parseFloat(schema.executionTime))
    //   ? parseFloat(schema.executionTime)
    //   : 0;
    // const isQueryProcessing: boolean =
    //   !schema.status && Object.keys(schema.responseJSON || {}).length <= 0 && executionTime === 0;
    // // const status: TestDriveQueryStatus = schema.status
    //   ? TestDriveQueryStatus.SUCCESS
    //   : isQueryProcessing
    //   ? TestDriveQueryStatus.PENDING
    //   : TestDriveQueryStatus.FAILURE;

    return {
      id: schema.id,
      createdAt: schema.createAt?.toISOString(),
      userId: this.parseObjectIdToString(schema.user),
      documentQuery: schema.documentQuery,
      documentType: schema.documentType as TestDriveQueryDocumentType,
      executionTime: parseInt(schema.executionTime, 10) || 0,
      queryKeys: schema.keys && {
        plate: schema.keys.placa,
        state: schema.keys.uf,
      },
      refClass: schema.refClass,
      responseJson: schema.responseJSON,
      stackResult: schema.stackResult?.map((service: MTestDriveQueryStackResultService) => ({
        rawData: service.rawData,
        serviceLogId: this.parseObjectIdToString(service.serviceLog),
        serviceCode: typeof service.serviceCode === 'string' ? parseInt(service.serviceCode) : service.serviceCode,
        dataFound: service.dataFound,
        hasError: service.hasError,
        supplierCode: service.supplierCode,
      })),
      failedServices: schema.failedServices?.map((service: MTestDriveQueryFailedService) => ({
        serviceLogId: this.parseObjectIdToString(service.serviceLog),
        serviceCode: typeof service.serviceCode === 'string' ? parseInt(service.serviceCode) : service.serviceCode,
        serviceName: service.serviceName,
        supplierCode: service.supplierCode,
      })),
      queryStatus: schema.queryStatus,
      servicesToReprocess: schema.servicesToReprocess,
      status: schema.status,
      queryCode: schema.code,
      logError: schema.log?.error,
      userActions: schema.userActions,
      control: schema.control,
    };
  }

  async countByDay(): Promise<number> {
    const [first]: { total: number }[] = await this.model.aggregate([
      {
        $match: {
          createAt: {
            $gte: this._dateTimeUtil.now().add(-1, 'day').toDate(),
            $lt: this._dateTimeUtil.now().toDate(),
          },
        },
      },
      {
        $match: {
          queryStatus: 'success',
        },
      },
      {
        $count: 'total',
      },
    ]);

    return first.total;
  }
}
