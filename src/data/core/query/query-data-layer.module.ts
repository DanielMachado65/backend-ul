import { Module, Provider } from '@nestjs/common';
import { ResponseCreditQueryUseCase } from 'src/data/core/query/credit/response-credit-query.usecase';
import { GetTestDriveUseCase } from 'src/data/core/query/get-test-drive.use-case';
import { CreateQueryV2UseCase } from 'src/data/core/query/v2/create-query-v2.use-case';
import { GetAlreadyDoneQueryV2UseCase } from 'src/data/core/query/v2/get-already-done-query-v2.use-case';
import { QueryResponseHelper } from 'src/data/core/query/v2/query-response.helper';
import { ReplaceFailedServicesUseCase } from 'src/data/core/query/v2/replace-failed-services.use-case';
import { ReprocessQueryUseCase } from 'src/data/core/query/v2/reprocess-query.use-case';
import { RequestQueryV2UseCase } from 'src/data/core/query/v2/request-query-v2.use-case';
import { RequestTestDriveUseCase } from 'src/data/core/query/v2/request-test-drive.use-case';
import { ResponseQueryUseCase } from 'src/data/core/query/v2/response-query.use-case';
import { ResponseReprocessQueryV2UseCase } from 'src/data/core/query/v2/response-reprocess-query-v2.use-case';
import { ResponseTestDriveUseCase } from 'src/data/core/query/v2/response-test-drive.use-case';
import { SendEmailOnQueryFinishUseCase } from 'src/data/core/query/v2/send-email-on-query-finish.usecase';
import { AutomateQueryDomain } from 'src/domain/core/query/automate-query.domain';
import { ResponseCreditQueryDomain } from 'src/domain/core/query/credit/response-credit-query.domain';
import { GetPreQueryDomain } from 'src/domain/core/query/get-pre-query.domain';
import { GetQueryConfirmationDomain } from 'src/domain/core/query/get-query-confirmation.domain';
import { GetQueryHistoryDomain } from 'src/domain/core/query/get-query-history.domain';
import { GetTestDriveDomain } from 'src/domain/core/query/get-test-drive.domain';
import { GetVehicleInformationsDomain } from 'src/domain/core/query/get-vehicle-informations.domain';
import { ReprocessQueryQueueDomain } from 'src/domain/core/query/reprocess-query-queue.domain';
import { ResquestAutoReprocessQueryDomain } from 'src/domain/core/query/request-auto-reprocess-query.domain';
import { CreateQueryV2Domain } from 'src/domain/core/query/v2/create-query-v2.domain';
import { GetAlreadyDoneQueryV2Domain } from 'src/domain/core/query/v2/get-already-done-query-v2.domain';
import { GetTotalTestsDrivesDomain } from 'src/domain/core/query/v2/get-total-tests-drives.domain';
import { ReplaceFailedServicesDomain } from 'src/domain/core/query/v2/replace-failed-services.domain';
import { ReprocessQueryDomain } from 'src/domain/core/query/v2/reprocess-query.domain';
import { RequestQueryV2Domain } from 'src/domain/core/query/v2/request-query-v2.domain';
import { RequestTestDriveDomain } from 'src/domain/core/query/v2/request-test-drive.domain';
import { ResponseQueryDomain } from 'src/domain/core/query/v2/response-query.domain';
import { ResponseReprocessQueryV2Domain } from 'src/domain/core/query/v2/response-reprocess-query-v2.domain';
import { ResponseTestDriveDomain } from 'src/domain/core/query/v2/response-test-drive.domain';
import { SendEmailOnQueryFinishDomain } from 'src/domain/core/query/v2/send-email-on-query-finish.domain';
import { SendQueryNotificationDomain } from 'src/domain/core/query/v2/send-query-response-integrator.domain';
import { UpdateCountTestDriveDomain } from 'src/domain/core/query/v2/update-count-test-drive.domain';
import { NotificationModule } from 'src/infrastructure/notification/notification.module';
import { CreateQueryDomain } from '../../../domain/core/query/create-query.domain';
import { GetAlreadyDoneQueryDomain } from '../../../domain/core/query/get-already-done-query.domain';
import { GetQueryComposerDomain } from '../../../domain/core/query/get-query-composer.domain';
import { GetQueryDomain } from '../../../domain/core/query/get-query.domain';
import { GetServicesFromQueryComposerDomain } from '../../../domain/core/query/get-services-from-query-composer.domain';
import { ReprocessFailedServiceDomain } from '../../../domain/core/query/reprocess-failed-service.domain';
import { RequestQueryDomain } from '../../../domain/core/query/request-query.domain';
import { BillingDataLayerModule } from '../../support/billing/billing-data-layer.module';
import { MyCarsQueryHelper } from '../product/my-cars-query.helper';
import { AutomateQueryUseCase } from './automate-query.use-case';
import { CreateQueryUseCase } from './create-query.use-case';
import { GetAlreadyDoneQueryUseCase } from './get-already-done-query.use-case';
import { GetPreQueryUseCase } from './get-pre-query.use-case';
import { GetQueryComposerUseCase } from './get-query-composer.use-case';
import { GetQueryConfirmationUseCase } from './get-query-confirmation.use-case';
import { GetQueryHistoryUseCase } from './get-query-history.use-case';
import { GetQueryUseCase } from './get-query.use-case';
import { GetServicesFromQueryComposerUseCase } from './get-services-from-query-composer.use-case';
import { GetVehicleInformationsUseCase } from './get-vehicle-informations.use-case';
import { QueryPopUpHelper } from './query-popup.helper';
import { QueryHelper } from './query.helper';
import { ReprocessFailedServiceUseCase } from './reprocess-failed-service.use-case';
import { ReprocessQueryQueueUseCase } from './reprocess-query-queue.use-case';
import { ResquestAutoReprocessQueryUseCase } from './request-auto-reprocess-query.use-case';
import { RequestQueryUseCase } from './request-query.use-case';
import { GetTotalTestsDrivesUseCase } from './v2/get-total-tests-drives.use-case';
import { SendQueryNotificationUseCase } from './v2/send-query-notification.use-case';
import { UpdateCountTestDriveUseCase } from './v2/update-count-test-drive.use-case';

const createQueryProvider: Provider = {
  provide: CreateQueryDomain,
  useClass: CreateQueryUseCase,
};

const getAlreadyDoneQueryProvider: Provider = {
  provide: GetAlreadyDoneQueryDomain,
  useClass: GetAlreadyDoneQueryUseCase,
};

const getQueryComposerProvider: Provider = {
  provide: GetQueryComposerDomain,
  useClass: GetQueryComposerUseCase,
};

const getQueryProvider: Provider = {
  provide: GetQueryDomain,
  useClass: GetQueryUseCase,
};

const getServicesFromQueryComposerProvider: Provider = {
  provide: GetServicesFromQueryComposerDomain,
  useClass: GetServicesFromQueryComposerUseCase,
};

const requestQueryProvider: Provider = {
  provide: RequestQueryDomain,
  useClass: RequestQueryUseCase,
};

const reprocessFailedServiceProvider: Provider = {
  provide: ReprocessFailedServiceDomain,
  useClass: ReprocessFailedServiceUseCase,
};

const reprocessFailedServiceQueueProvider: Provider = {
  provide: ReprocessQueryQueueDomain,
  useClass: ReprocessQueryQueueUseCase,
};

const getQueryHistoryProvider: Provider = {
  provide: GetQueryHistoryDomain,
  useClass: GetQueryHistoryUseCase,
};

const getQueryConfirmationProvider: Provider = {
  provide: GetQueryConfirmationDomain,
  useClass: GetQueryConfirmationUseCase,
};

const requestTestDriveProvider: Provider = {
  provide: RequestTestDriveDomain,
  useClass: RequestTestDriveUseCase,
};

const responseTestDriveProvider: Provider = {
  provide: ResponseTestDriveDomain,
  useClass: ResponseTestDriveUseCase,
};

const getTestDriveProvider: Provider = {
  provide: GetTestDriveDomain,
  useClass: GetTestDriveUseCase,
};

const requestQueryV2Provider: Provider = {
  provide: RequestQueryV2Domain,
  useClass: RequestQueryV2UseCase,
};

const createQueryV2Provider: Provider = {
  provide: CreateQueryV2Domain,
  useClass: CreateQueryV2UseCase,
};

const responseQueryProvider: Provider = {
  provide: ResponseQueryDomain,
  useClass: ResponseQueryUseCase,
};

const reprocessQueryProvider: Provider = {
  provide: ReprocessQueryDomain,
  useClass: ReprocessQueryUseCase,
};

const getAlreadyDoneQueryV2Provider: Provider = {
  provide: GetAlreadyDoneQueryV2Domain,
  useClass: GetAlreadyDoneQueryV2UseCase,
};

const resquestAutoReprocessQueryProvider: Provider = {
  provide: ResquestAutoReprocessQueryDomain,
  useClass: ResquestAutoReprocessQueryUseCase,
};

const responseReprocessQueryProvider: Provider = {
  provide: ResponseReprocessQueryV2Domain,
  useClass: ResponseReprocessQueryV2UseCase,
};

const sendEmailOnQueryFinishProvider: Provider = {
  provide: SendEmailOnQueryFinishDomain,
  useClass: SendEmailOnQueryFinishUseCase,
};

const replaceFailedServicesProvicer: Provider = {
  provide: ReplaceFailedServicesDomain,
  useClass: ReplaceFailedServicesUseCase,
};

const responseCreditQueryProvider: Provider = {
  provide: ResponseCreditQueryDomain,
  useClass: ResponseCreditQueryUseCase,
};

const sendQueryNotificationProvider: Provider = {
  provide: SendQueryNotificationDomain,
  useClass: SendQueryNotificationUseCase,
};

const getTotalTestsDrivesProvider: Provider = {
  provide: GetTotalTestsDrivesDomain,
  useClass: GetTotalTestsDrivesUseCase,
};

const updateCountTestDriveProvider: Provider = {
  provide: UpdateCountTestDriveDomain,
  useClass: UpdateCountTestDriveUseCase,
};

const getPreQueryProvider: Provider = {
  provide: GetPreQueryDomain,
  useClass: GetPreQueryUseCase,
};

const automateQueryProvider: Provider = {
  provide: AutomateQueryDomain,
  useClass: AutomateQueryUseCase,
};

const getVehicleInformationsProvider: Provider = {
  provide: GetVehicleInformationsDomain,
  useClass: GetVehicleInformationsUseCase,
};

@Module({
  imports: [BillingDataLayerModule, NotificationModule],
  controllers: [],
  providers: [
    QueryResponseHelper,
    QueryPopUpHelper,
    QueryHelper,
    MyCarsQueryHelper,
    createQueryProvider,
    getAlreadyDoneQueryProvider,
    getQueryComposerProvider,
    getQueryProvider,
    getServicesFromQueryComposerProvider,
    reprocessFailedServiceQueueProvider,
    requestQueryProvider,
    reprocessFailedServiceProvider,
    getQueryHistoryProvider,
    getQueryConfirmationProvider,
    requestTestDriveProvider,
    getTestDriveProvider,
    responseTestDriveProvider,
    requestQueryV2Provider,
    createQueryV2Provider,
    responseQueryProvider,
    reprocessQueryProvider,
    getAlreadyDoneQueryV2Provider,
    resquestAutoReprocessQueryProvider,
    responseReprocessQueryProvider,
    sendEmailOnQueryFinishProvider,
    replaceFailedServicesProvicer,
    responseCreditQueryProvider,
    sendQueryNotificationProvider,
    getTotalTestsDrivesProvider,
    updateCountTestDriveProvider,
    getPreQueryProvider,
    automateQueryProvider,
    getVehicleInformationsProvider,
  ],
  exports: [
    createQueryProvider,
    getAlreadyDoneQueryProvider,
    getQueryComposerProvider,
    getQueryProvider,
    getServicesFromQueryComposerProvider,
    reprocessFailedServiceQueueProvider,
    requestQueryProvider,
    reprocessFailedServiceProvider,
    getQueryHistoryProvider,
    getQueryConfirmationProvider,
    requestTestDriveProvider,
    getTestDriveProvider,
    responseTestDriveProvider,
    requestQueryV2Provider,
    createQueryV2Provider,
    responseQueryProvider,
    reprocessQueryProvider,
    getAlreadyDoneQueryV2Provider,
    resquestAutoReprocessQueryProvider,
    responseReprocessQueryProvider,
    sendEmailOnQueryFinishProvider,
    replaceFailedServicesProvicer,
    responseCreditQueryProvider,
    sendQueryNotificationProvider,
    getTotalTestsDrivesProvider,
    updateCountTestDriveProvider,
    getPreQueryProvider,
    automateQueryProvider,
    getVehicleInformationsProvider,
  ],
})
export class QueryDataLayerModule {}
