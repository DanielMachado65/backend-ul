import { UpdateNotificationsUseCase } from '../update-notifications.use-case';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NoUserFoundDomainError, UnknownDomainError } from 'src/domain/_entity/result.error';
import { UpdateNotificationDto } from 'src/domain/_layer/presentation/dto/update-notifications-input.dto';
import { NotificationInputPayload } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { UserType } from 'src/domain/_entity/user.entity';

describe(UpdateNotificationsUseCase.name, () => {
  let updateNotificationsUseCase: UpdateNotificationsUseCase;
  let mockNotificationInfraService: jest.Mocked<NotificationInfrastructure>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const userId: string = 'some-user-id';
  const notificationsToUpdate: ReadonlyArray<UpdateNotificationDto> = [
    { notificationId: 'notification-id-1', wasSeen: true },
    { notificationId: 'notification-id-2', wasSeen: false },
  ];
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
      markAsSeen: jest.fn(),
    } as unknown as jest.Mocked<NotificationInfrastructure>;

    mockUserRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    updateNotificationsUseCase = new UpdateNotificationsUseCase(mockNotificationInfraService, mockUserRepository);
  });

  describe('updateNotifications', () => {
    it('should successfully update notifications', async () => {
      const updatedNotificationPayloads: ReadonlyArray<NotificationInputPayload> = notificationsToUpdate.map(
        (notification: UpdateNotificationDto) => ({
          id: notification.notificationId,
          wasSeen: notification.wasSeen,
        }),
      );

      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockNotificationInfraService.markAsSeen.mockResolvedValue(updatedNotificationPayloads);

      const result: unknown = await updateNotificationsUseCase
        .updateNotifications(userId, notificationsToUpdate)
        .unsafeRun();

      expect(result).toEqual({
        notifications: updatedNotificationPayloads.map((payload: NotificationInputPayload) => ({
          id: payload.id,
          updated: payload.wasSeen,
        })),
      });
      expect(mockNotificationInfraService.markAsSeen).toHaveBeenCalledWith(userId, updatedNotificationPayloads);
    });

    it('should throw an error when notifications array is empty', async () => {
      mockUserRepository.getById.mockResolvedValue(userExampleMock);

      await expect(updateNotificationsUseCase.updateNotifications(userId, []).unsafeRun()).rejects.toThrow(
        UnknownDomainError,
      );
      expect(mockNotificationInfraService.markAsSeen).toHaveBeenCalled();
    });

    it('should throw an error when user is not found', async () => {
      mockUserRepository.getById.mockResolvedValue(null);

      await expect(
        updateNotificationsUseCase.updateNotifications(userId, notificationsToUpdate).unsafeRun(),
      ).rejects.toThrow(NoUserFoundDomainError);
      expect(mockNotificationInfraService.markAsSeen).not.toHaveBeenCalled();
    });
  });
});
