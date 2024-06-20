import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserWebhookUseCase } from 'src/data/core/user/create-user-webhook.use-case';
import { WebhookMaxLimitError } from 'src/domain/_entity/result.error';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { CreateUserWebhookDomain, CreateUserWebhookResult } from 'src/domain/core/user/create-user-webhook.domain';

describe('CreateUserWebhookUseCase', () => {
  let sut: CreateUserWebhookUseCase;
  let module: TestingModule;
  let userRepository: UserRepository;

  const userId: string = 'any_user_id';
  const urls: string[] = ['any_url_1', 'any_url_2'];
  const user: Partial<UserDto> = {
    webhookUrls: urls,
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: CreateUserWebhookDomain,
          useClass: CreateUserWebhookUseCase,
        },
        {
          provide: UserRepository,
          useValue: {
            updateById: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(CreateUserWebhookDomain);
  });

  beforeEach(() => {
    userRepository = module.get(UserRepository);
  });

  describe('#execute', () => {
    test('should call updateById one time with userId and urls', async () => {
      await sut.execute(userId, urls).safeRun();

      expect(userRepository.updateById).toHaveBeenCalledTimes(1);
      expect(userRepository.updateById).toHaveBeenCalledWith(userId, { webhookUrls: urls });
    });

    test('should retrun new urls created', async () => {
      jest.spyOn(userRepository, 'updateById').mockResolvedValueOnce(user as UserDto);
      const result: CreateUserWebhookResult = await sut.execute(userId, urls).safeRun();

      expect(result.getRight()).toEqual({ webhookUrls: urls });
    });

    test('should can not insert six or more urls', async () => {
      const error: WebhookMaxLimitError = new WebhookMaxLimitError();
      const result: CreateUserWebhookResult = await sut
        .execute(userId, ['url_1', 'url_2', 'url_3', 'url_4', 'url_5', 'url_6'])
        .safeRun();

      expect(result.getLeft()).toEqual(error);
    });
  });
});
