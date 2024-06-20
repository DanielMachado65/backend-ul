import { Module, Provider } from '@nestjs/common';

import { UpdateUserProfileUseCase } from 'src/data/core/user/update-user.use-case';
import { AuthDataLayerModule } from 'src/data/support/auth/auth-data-layer.module';
import { AddUserAtPaymentGatewayDomain } from 'src/domain/core/user/add-user-at-payment-gateway.domain';
import { AutomateUserDomain } from 'src/domain/core/user/automate-user.domain';
import { CancelUserDeletionDomain } from 'src/domain/core/user/cancel-user-deletion.domain';
import { CreateUserWebhookDomain } from 'src/domain/core/user/create-user-webhook.domain';
import { DownloadUserLogsDomain } from 'src/domain/core/user/download-user-logs.domain';
import { GetPaginatedUserLogsDomain } from 'src/domain/core/user/get-paginated-user-logs.domain';
import { GetUserConsentsDomain } from 'src/domain/core/user/get-user-consents.domain';
import { GetUserDataInSheetDomain } from 'src/domain/core/user/get-user-data-in-sheet.domain';
import { GetUserProfileDomain } from 'src/domain/core/user/get-user-profile.domain';
import { GetWhenUserDeletedDomain } from 'src/domain/core/user/get-when-user-deleted.domain';
import { GiveConsentDomain } from 'src/domain/core/user/give-consent.domain';
import { GiveOrRemoveConsentDomain } from 'src/domain/core/user/give-or-remove-consent.domain';
import { ListWebhooksDomain } from 'src/domain/core/user/list-webhooks.domain';
import { SetUserToDeletionDomain } from 'src/domain/core/user/set-user-to-deletion.domain';
import { UpdateUserProfileDomain } from 'src/domain/core/user/update-user.domain';
import { AddUserDomain } from '../../../domain/core/user/add-user.domain';
import { GetUserDomain } from '../../../domain/core/user/get-user.domain';
import { BillingDataLayerModule } from '../../support/billing/billing-data-layer.module';
import { AddUserAtPaymentGatewayUseCase } from './add-user-at-payment-gateway.use-case';
import { AddUserUseCase } from './add-user.use-case';
import { AutomateUserUseCase } from './automate-user.use-case';
import { CancelUserDeletionUseCase } from './cancel-user-deletion.use-case';
import { CreateUserWebhookUseCase } from './create-user-webhook.use-case';
import { DownloadUserLogsUseCase } from './download-user-logs.use-case';
import { GetPaginatedUserLogsUseCase } from './get-paginated-user-logs.use-case';
import { GetUserConsentsUseCase } from './get-user-consents.use-case';
import { GetUserDataInSheetUseCase } from './get-user-data-in-sheet.use-case';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { GetUserUseCase } from './get-user.use-case';
import { GetWhenUserDeletedUseCase } from './get-when-user-deleted.use-case';
import { GiveConsentUseCase } from './give-consent.use-case';
import { GiveOrRemoveConsentUseCase } from './give-or-remove-consent.use-case';
import { ListWebhooksUseCase } from './list-webhooks.use-case';
import { SetUserToDeletionUseCase } from './set-user-to-deletion.use-case';
import { UserHelper } from './user.helper';

const getUserProvider: Provider = {
  provide: GetUserDomain,
  useClass: GetUserUseCase,
};

const addUserProvider: Provider = {
  provide: AddUserDomain,
  useClass: AddUserUseCase,
};

const getUserProfileProvider: Provider = {
  provide: GetUserProfileDomain,
  useClass: GetUserProfileUseCase,
};

const updateUserProfileProvider: Provider = {
  provide: UpdateUserProfileDomain,
  useClass: UpdateUserProfileUseCase,
};

const cancelUserDeletionProvider: Provider = {
  provide: CancelUserDeletionDomain,
  useClass: CancelUserDeletionUseCase,
};

const setUserToDeletionProvider: Provider = {
  provide: SetUserToDeletionDomain,
  useClass: SetUserToDeletionUseCase,
};

const getUserDataInSheetProvider: Provider = {
  provide: GetUserDataInSheetDomain,
  useClass: GetUserDataInSheetUseCase,
};

const getPaginatedUserLogsProvider: Provider = {
  provide: GetPaginatedUserLogsDomain,
  useClass: GetPaginatedUserLogsUseCase,
};

const downloadUserLogsProvider: Provider = {
  provide: DownloadUserLogsDomain,
  useClass: DownloadUserLogsUseCase,
};

const getUserConsentsProvider: Provider = {
  provide: GetUserConsentsDomain,
  useClass: GetUserConsentsUseCase,
};

const giveOrRemoveConsentProvider: Provider = {
  provide: GiveOrRemoveConsentDomain,
  useClass: GiveOrRemoveConsentUseCase,
};

const getWhenUserDeletedProvider: Provider = {
  provide: GetWhenUserDeletedDomain,
  useClass: GetWhenUserDeletedUseCase,
};

const addUserAtPaymentGatewayProvider: Provider = {
  provide: AddUserAtPaymentGatewayDomain,
  useClass: AddUserAtPaymentGatewayUseCase,
};

const giveConsentProvider: Provider = {
  provide: GiveConsentDomain,
  useClass: GiveConsentUseCase,
};

const listWebhooksProvider: Provider = {
  provide: ListWebhooksDomain,
  useClass: ListWebhooksUseCase,
};

const createUserWebhookProvider: Provider = {
  provide: CreateUserWebhookDomain,
  useClass: CreateUserWebhookUseCase,
};

const automateUserProvider: Provider = {
  provide: AutomateUserDomain,
  useClass: AutomateUserUseCase,
};

@Module({
  imports: [BillingDataLayerModule, AuthDataLayerModule],
  controllers: [],
  providers: [
    UserHelper,
    getUserProvider,
    getUserProfileProvider,
    addUserProvider,
    updateUserProfileProvider,
    cancelUserDeletionProvider,
    setUserToDeletionProvider,
    getUserDataInSheetProvider,
    getPaginatedUserLogsProvider,
    downloadUserLogsProvider,
    getUserConsentsProvider,
    giveOrRemoveConsentProvider,
    getWhenUserDeletedProvider,
    addUserAtPaymentGatewayProvider,
    giveConsentProvider,
    listWebhooksProvider,
    createUserWebhookProvider,
    automateUserProvider,
  ],
  exports: [
    getUserProvider,
    getUserProfileProvider,
    addUserProvider,
    updateUserProfileProvider,
    cancelUserDeletionProvider,
    setUserToDeletionProvider,
    getUserDataInSheetProvider,
    getPaginatedUserLogsProvider,
    downloadUserLogsProvider,
    getUserConsentsProvider,
    giveOrRemoveConsentProvider,
    getWhenUserDeletedProvider,
    addUserAtPaymentGatewayProvider,
    giveConsentProvider,
    listWebhooksProvider,
    createUserWebhookProvider,
    automateUserProvider,
  ],
})
export class UserDataLayerModule {}
