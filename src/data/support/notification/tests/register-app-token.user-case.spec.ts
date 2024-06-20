import { RegisterAppTokenUseCase } from '../register-app-token.use-case';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { BadRequestDomainError } from 'src/domain/_entity/result.error';
import { UserType } from 'src/domain/_entity/user.entity';

describe(RegisterAppTokenUseCase.name, () => {
  let registerAppTokenUseCase: RegisterAppTokenUseCase;
  let mockNotificationInfraService: jest.Mocked<NotificationInfrastructure>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const validAppToken: string = 'valid-app-token';
  const invalidAppToken: string = '';
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
    webhookUrls: null,
  };

  beforeEach(() => {
    mockNotificationInfraService = {
      setCredentials: jest.fn(),
      findSubscriber: jest.fn(),
      addSubscriber: jest.fn(),
      removeAllTokens: jest.fn(),
      // ... other methods
    } as unknown as jest.Mocked<NotificationInfrastructure>;

    mockUserRepository = {
      getById: jest.fn(),
      // ... other methods
    } as unknown as jest.Mocked<UserRepository>;

    registerAppTokenUseCase = new RegisterAppTokenUseCase(mockNotificationInfraService, mockUserRepository);
  });

  describe('addToken', () => {
    it('should successfully add a token', async () => {
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockNotificationInfraService.findSubscriber.mockResolvedValue(null);
      mockNotificationInfraService.addSubscriber.mockResolvedValue({
        subscriberId: '123',
        email: 'test',
        firstName: 'da',
        phoneNumber: '124123',
      });
      mockNotificationInfraService.setCredentials.mockResolvedValue(true);

      const result: unknown = await registerAppTokenUseCase.addToken(userId, validAppToken).unsafeRun();

      expect(result).toEqual({ appTokenRegistered: true });
    });

    it('should successfully add a token when a user already is in database', async () => {
      mockUserRepository.getById.mockResolvedValue(userExampleMock);
      mockNotificationInfraService.findSubscriber.mockResolvedValue({
        subscriberId: '123',
        email: 'test',
        firstName: 'da',
        phoneNumber: '124123',
      });
      mockNotificationInfraService.setCredentials.mockResolvedValue(true);

      const result: unknown = await registerAppTokenUseCase.addToken(userId, validAppToken).unsafeRun();

      expect(result).toEqual({ appTokenRegistered: true });
    });

    it('should throw an error when adding an invalid token', async () => {
      mockUserRepository.getById.mockResolvedValue(userExampleMock);

      await expect(registerAppTokenUseCase.addToken(userId, invalidAppToken).unsafeRun()).rejects.toThrow(
        BadRequestDomainError,
      );
    });
  });
});
