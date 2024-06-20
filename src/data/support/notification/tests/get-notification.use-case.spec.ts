import { NotificationChannel } from 'src/domain/_entity/notification.entity';
import { UserType } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NotificationQueryAllFetchPayload } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { GetNotificationsUseCase } from '../get-notifications.use-case';

const userId: string = 'some-user-id';
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

describe(GetNotificationsUseCase.name, () => {
  let getNotificationsUseCase: GetNotificationsUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockNotificationInfraService: jest.Mocked<NotificationInfrastructure>;

  beforeEach(() => {
    mockUserRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockNotificationInfraService = {
      getTotalOfNotificationsUnseenByUser: jest.fn(),
      getNotifications: jest.fn(),
    } as unknown as jest.Mocked<NotificationInfrastructure>;

    getNotificationsUseCase = new GetNotificationsUseCase(mockUserRepository, mockNotificationInfraService);
  });

  describe('getUnseenNotification', () => {
    it('should return the count of unseen notifications', async () => {
      const unseenCount: number = 5;

      mockUserRepository.getById.mockResolvedValue(userExampleMock);

      mockNotificationInfraService.getTotalOfNotificationsUnseenByUser.mockResolvedValue(unseenCount);

      const result: unknown = await getNotificationsUseCase.getUnseenNotification(userId).unsafeRun();

      expect(result).toEqual({ total: unseenCount });
      expect(mockUserRepository.getById).toHaveBeenCalledWith(userId);
      expect(mockNotificationInfraService.getTotalOfNotificationsUnseenByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('getPaginated', () => {
    it('should return paginated notifications', async () => {
      const userId: string = 'some-user-id';
      const page: number = 1;
      const perPage: number = 10;
      const totalNotifications: number = 50;

      const notificationQueryAllFetchPayload: NotificationQueryAllFetchPayload = {
        totalCount: totalNotifications,
        page: page,
        pageSize: perPage,
        hasMore: true,
        data: [],
      };

      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockNotificationInfraService.getNotifications.mockResolvedValue(notificationQueryAllFetchPayload);

      const result: unknown = await getNotificationsUseCase
        .getPaginated(userId, NotificationChannel.EMAIL, page, perPage)
        .unsafeRun();

      expect(result).toMatchObject({
        totalPages: expect.any(Number),
        currentPage: page,
        itemsPerPage: perPage,
        count: totalNotifications,
      });

      expect(mockUserRepository.getById).toHaveBeenCalledWith(userId);
      expect(mockNotificationInfraService.getNotifications).toHaveBeenCalledWith(
        userExampleMock.id,
        NotificationChannel.EMAIL,
        page - 1,
        perPage,
      );
    });
  });
});
