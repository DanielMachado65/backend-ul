import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { SendPotencialUserEmailUseCase } from '../send-potencial-user-email.use-case';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserEntity } from 'src/domain/_entity/user.entity';
import { NotificationEmailIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { SendPotencialUserEmailResult } from 'src/domain/support/email/send-potencial-user-email.domain';

describe('SendPotencialUserEmailUseCase', () => {
  let sut: SendPotencialUserEmailUseCase;
  let module: TestingModule;
  let userRepository: jest.Mocked<UserRepository>;
  let notificationInfrastructure: jest.Mocked<NotificationInfrastructure>;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        SendPotencialUserEmailUseCase,
        {
          provide: UserRepository,
          useValue: {
            getByEmail: jest.fn(),
            getByIds: jest.fn(),
            updateManyBy: jest.fn(),
          },
        },
        {
          provide: NotificationInfrastructure,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(true),
            findSubscriber: jest.fn(),
            addSubscriber: jest.fn(),
            updateSubscriber: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = module.get<SendPotencialUserEmailUseCase>(SendPotencialUserEmailUseCase);
    userRepository = module.get<UserRepository>(UserRepository) as jest.Mocked<UserRepository>;
    notificationInfrastructure = module.get<NotificationInfrastructure>(
      NotificationInfrastructure,
    ) as jest.Mocked<NotificationInfrastructure>;
  });

  describe('#send', () => {
    const to: readonly string[] = ['test@example.com'];
    const usersIds: ReadonlyArray<Pick<UserDto, 'id'>> = [{ id: 'user1' }, { id: 'user2' }];
    const foundUsers: ReadonlyArray<UserDto> = [
      { id: 'user1', email: 'user1@example.com', name: 'User One' } as UserEntity,
      { id: 'user2', email: 'user2@example.com', name: 'User Two' } as UserEntity,
    ];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should attempt to find users by email and then find or create users by IDs', async () => {
      userRepository.getByEmail.mockResolvedValue(foundUsers[0]);
      userRepository.getByIds.mockResolvedValue(foundUsers);

      await sut.send(to, usersIds).safeRun();

      expect(userRepository.getByEmail).toHaveBeenCalledWith(to[0]);
      expect(userRepository.getByIds).toHaveBeenCalledWith(expect.arrayContaining([{ id: 'user1' }, { id: 'user2' }]));
    });

    it('should send notification if users are found', async () => {
      userRepository.getByEmail.mockResolvedValue(foundUsers[0]);
      userRepository.getByIds.mockResolvedValue(foundUsers);

      await sut.send(to, usersIds).safeRun();

      // Verifique se os argumentos exatos esperados são passados para sendEmail
      expect(notificationInfrastructure.sendEmail).toHaveBeenCalledWith(
        NotificationEmailIdentifier.POTENCIAL_USER,
        expect.any(Array),
        { users: expect.arrayContaining([...foundUsers]) },
      );
    });

    it('should not send notification if no users are found', async () => {
      userRepository.getByEmail.mockResolvedValueOnce(null);

      await sut.send(to, usersIds).safeRun();

      expect(notificationInfrastructure.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle updates and checks for invite send status correctly', async () => {
      userRepository.getByEmail.mockImplementation((email: string) =>
        Promise.resolve(foundUsers.find((user: UserDto) => user.email === email)),
      );
      userRepository.getByIds.mockResolvedValue(foundUsers);
      userRepository.updateManyBy.mockResolvedValue(foundUsers);

      const result: SendPotencialUserEmailResult = await sut.send(to, usersIds).safeRun();

      expect(result).toBeTruthy();
    });
  });
});
