import { SoftDeleteNotificationsUseCase } from '../soft-delete-notifications.use-case';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { BadRequestDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { NotificationInputPayload } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { UserType } from 'src/domain/_entity/user.entity';

describe(SoftDeleteNotificationsUseCase.name, () => {
  let softDeleteNotificationsUseCase: SoftDeleteNotificationsUseCase;
  let mockNotificationInfraService: jest.Mocked<NotificationInfrastructure>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const userId: string = 'some-user-id';
  const notificationIds: ReadonlyArray<string> = ['notification-id-1', 'notification-id-2'];
  const userExampleMock: UserDto = {
    billingId: 'some-billing-id',
    id: userId,
    email: 'some-email',
    cpf: 'some-cpf',
    name: 'some-name',
    phoneNumber: 'some-phone-number',
    address: {
      city: 'some-city',
      complement: 'some-complement',
      neighborhood: 'some-neighborhood',
      number: 'some-number',
      state: 'some-state',
      street: 'some-street',
      zipCode: 'some-zip-code',
    },
    lastLogin: new Date().toString(),
    createdAt: new Date().toISOString(),
    type: UserType.MASTER,
    company: null,
    status: null,
    creationOrigin: null,
    hierarchy: null,
    externalControls: null,
    whenDeletedAt: null,
    deletedAt: null,
  };

  beforeEach(() => {
    mockNotificationInfraService = {
      deleteMessages: jest.fn(),
    } as unknown as jest.Mocked<NotificationInfrastructure>;

    mockUserRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    softDeleteNotificationsUseCase = new SoftDeleteNotificationsUseCase(
      mockNotificationInfraService,
      mockUserRepository,
    );
  });

  describe('softDeleteNotifications', () => {
    it('should successfully soft delete notifications', async () => {
      const deletedNotificationPayloads: ReadonlyArray<NotificationInputPayload> = notificationIds.map(
        (id: string) => ({
          id: id,
          deleted: true,
        }),
      );

      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockNotificationInfraService.deleteMessages.mockResolvedValue(deletedNotificationPayloads);

      const result: unknown = await softDeleteNotificationsUseCase
        .softDeleteNotifications(userId, notificationIds)
        .unsafeRun();

      expect(result).toEqual({
        notifications: deletedNotificationPayloads,
      });
      expect(mockNotificationInfraService.deleteMessages).toHaveBeenCalledWith(notificationIds);
    });

    it('should throw an error when notifications array is empty', async () => {
      mockUserRepository.getById.mockResolvedValue(userExampleMock);

      await expect(softDeleteNotificationsUseCase.softDeleteNotifications(userId, []).unsafeRun()).rejects.toThrow(
        BadRequestDomainError,
      );
      expect(mockNotificationInfraService.deleteMessages).not.toHaveBeenCalled();
    });

    it('should throw an error when user is not found', async () => {
      mockUserRepository.getById.mockResolvedValue(null);

      await expect(
        softDeleteNotificationsUseCase.softDeleteNotifications(userId, notificationIds).unsafeRun(),
      ).rejects.toThrow(UnknownDomainError);
      expect(mockNotificationInfraService.deleteMessages).not.toHaveBeenCalled();
    });
  });
});
