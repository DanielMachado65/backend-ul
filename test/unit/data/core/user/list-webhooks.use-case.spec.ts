import { Test, TestingModule } from '@nestjs/testing';
import { ListWebhooksUseCase } from 'src/data/core/user/list-webhooks.use-case';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { ListWebhooksDomain, ListWebhooksResult } from 'src/domain/core/user/list-webhooks.domain';

describe('ListWebhooksUseCase', () => {
  let sut: ListWebhooksUseCase;
  let module: TestingModule;
  let userRepository: UserRepository;

  const userId: string = 'any_user_id';
  const user: Partial<UserDto> = {
    webhookUrls: ['any_url_1'],
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: ListWebhooksDomain,
          useClass: ListWebhooksUseCase,
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(ListWebhooksDomain);
  });

  beforeEach(() => {
    userRepository = module.get(UserRepository);
  });

  describe('#execute', () => {
    test('should call getById one time with userId', async () => {
      await sut.execute(userId).safeRun();

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(userId);
    });

    test('should return somes urls', async () => {
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(user as UserDto);
      const result: ListWebhooksResult = await sut.execute(userId).safeRun();

      expect(result.getRight()).toEqual({ webhookUrls: user.webhookUrls });
    });
  });
});
