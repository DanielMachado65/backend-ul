import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailOnQueryFinishUseCase } from 'src/data/core/query/v2/send-email-on-query-finish.usecase';
import { UnknownDomainError } from 'src/domain/_entity/result.error';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryRepository } from 'src/domain/_layer/infrastructure/repository/query.repository';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { SendEmailOnQueryFinishDomain } from 'src/domain/core/query/v2/send-email-on-query-finish.domain';
import { mockQueryDto } from 'test/mocks/dto/query.dto.mock';
import { mockUserDto } from 'test/mocks/dto/user.dto.mock';

describe('SendEmailOnQueryFinishUseCase', () => {
  let sut: SendEmailOnQueryFinishUseCase;
  let module: TestingModule;
  let queryRepository: QueryRepository;
  let userRepository: UserRepository;
  let notificationService: NotificationServiceGen;

  const userDto: UserDto = mockUserDto();
  const queryDto: QueryDto = mockQueryDto();
  const queryId: string = queryDto.id;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        {
          provide: SendEmailOnQueryFinishDomain,
          useClass: SendEmailOnQueryFinishUseCase,
        },
        {
          provide: QueryRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue(queryDto),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn().mockResolvedValue(userDto),
          },
        },
        {
          provide: NotificationServiceGen,
          useValue: {
            dispatch: jest.fn(),
          },
        },
      ],
    }).compile();
  });

  beforeAll(async () => {
    queryRepository = module.get(QueryRepository);
    userRepository = module.get(UserRepository);
    notificationService = module.get(NotificationServiceGen);
    sut = await module.resolve(SendEmailOnQueryFinishDomain);
  });

  test('should return an UnknownDomainError if has no query', async () => {
    jest.spyOn(queryRepository, 'getById').mockImplementationOnce(() => {
      throw new Error('any_error');
    });

    const promise: Promise<void> = sut.send(queryId).unsafeRun();

    await expect(promise).rejects.toThrow(UnknownDomainError);
    expect(userRepository.getById).not.toHaveBeenCalled();
    expect(notificationService.dispatch).not.toHaveBeenCalled();
  });

  test('should return an UnknownDomainError if has no user', async () => {
    jest.spyOn(userRepository, 'getById').mockImplementationOnce(() => {
      throw new Error('any_error');
    });

    const promise: Promise<void> = sut.send(queryId).unsafeRun();

    await expect(promise).rejects.toThrow(UnknownDomainError);
    expect(queryRepository.getById).toHaveBeenCalledTimes(1);
    expect(queryRepository.getById).toHaveBeenCalledWith(queryId);
    expect(notificationService.dispatch).not.toHaveBeenCalled();
  });

  test('should call notification service on success', async () => {
    await sut.send(queryId).safeRun();

    expect(queryRepository.getById).toHaveBeenCalledTimes(1);
    expect(queryRepository.getById).toHaveBeenCalledWith(queryId);
    expect(userRepository.getById).toHaveBeenCalledTimes(1);
    expect(userRepository.getById).toHaveBeenCalledWith(queryDto.userId);
    expect(notificationService.dispatch).toHaveBeenCalledTimes(1);
    expect(notificationService.dispatch).toHaveBeenCalledWith(
      NotificationTransport.EMAIL,
      NotificationType.QUERY_SUCCESS,
      {
        email: userDto.email,
        name: userDto.name.split(' ')[0],
        queryCode: queryDto.queryCode,
        queryId: queryDto.id,
        queryName: queryDto.refClass,
      },
    );
  });
});
