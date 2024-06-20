import { Test, TestingModule } from '@nestjs/testing';
import { SendQueryNotificationUseCase } from 'src/data/core/query/v2/send-query-notification.use-case';
import { QueryDocumentType, QueryFailedService, QueryStatus } from 'src/domain/_entity/query.entity';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import { NotificationIdentifier } from 'src/domain/_layer/infrastructure/notification/notification-indentifier.types';
import { NotificationInfrastructure } from 'src/domain/_layer/infrastructure/notification/notification-infrastructure';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { BlogService } from 'src/domain/_layer/infrastructure/service/blog.service';
import {
  NotificationServiceGen,
  NotificationTransport,
  NotificationType,
} from 'src/domain/_layer/infrastructure/service/notification';
import { VideoPlatformService } from 'src/domain/_layer/infrastructure/service/video-platform.service';
import { WebhookService } from 'src/domain/_layer/infrastructure/service/webhook.service';
import { SendQueryNotificationDomain } from 'src/domain/core/query/v2/send-query-response-integrator.domain';

describe('SendQueryNotificationUseCase', () => {
  let sut: SendQueryNotificationUseCase;
  let module: TestingModule;
  let webhookService: WebhookService;
  let userRepository: UserRepository;
  let notificationInfrastructure: NotificationInfrastructure;
  let queryJob: QueryJob;
  let notificationServiceGen: NotificationServiceGen;

  const query: Partial<QueryDto> = {
    id: 'any_id',
    queryCode: 100,
    documentType: QueryDocumentType.PLATE,
    documentQuery: 'any_document_query',
    queryStatus: QueryStatus.SUCCESS,
    refClass: 'any_ref_class',
    version: 2,
    createdAt: 'any_created_at',
    failedServices: [
      {
        serviceCode: 3,
        serviceName: 'any_service_name',
      } as QueryFailedService,
    ],
    responseJson: {},
  };

  const user: Partial<UserDto> = {
    id: 'any_user_id',
    email: 'any_email',
    name: 'Tio Bob',
    webhookUrls: ['any_url'],
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: SendQueryNotificationDomain,
          useClass: SendQueryNotificationUseCase,
        },
        {
          provide: WebhookService,
          useValue: {
            sendMany: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getById: jest.fn(),
          },
        },
        {
          provide: NotificationInfrastructure,
          useValue: {
            dispatch: jest.fn(),
          },
        },
        {
          provide: NotificationServiceGen,
          useValue: {
            dispatch: jest.fn(),
          },
        },
        {
          provide: QueryJob,
          useValue: {
            createJob: jest.fn(),
          },
        },
        {
          provide: VideoPlatformService,
          useValue: {
            getEmbedInfo: jest.fn(),
          },
        },
        {
          provide: BlogService,
          useValue: {
            fetchPostData: jest.fn(),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(SendQueryNotificationDomain);
  });

  beforeEach(() => {
    webhookService = module.get(WebhookService);
    userRepository = module.get(UserRepository);
    notificationInfrastructure = module.get(NotificationInfrastructure);
    queryJob = module.get(QueryJob);
    notificationServiceGen = module.get(NotificationServiceGen);
  });

  describe('#execute', () => {
    test('should call getById one time with userId', async () => {
      await sut.execute(query as QueryDto).safeRun();

      expect(userRepository.getById).toHaveBeenCalledTimes(1);
      expect(userRepository.getById).toHaveBeenCalledWith(query.userId);
    });

    test('should call sendMany one time', async () => {
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce(user as UserDto);

      await sut.execute(query as QueryDto).safeRun();

      expect(webhookService.sendMany).toHaveBeenCalledTimes(1);
      expect(webhookService.sendMany).toHaveBeenCalledWith(user.webhookUrls, query);
    });

    test('should not call sendMany if user not has list of webhook', async () => {
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce({ webhookUrls: [] } as UserDto);

      await sut.execute(query as QueryDto).safeRun();

      expect(webhookService.sendMany).toHaveBeenCalledTimes(0);
    });

    test('should call notification dispatch if query status is not failure', async () => {
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce({ webhookUrls: [] } as UserDto);

      await sut.execute(query as QueryDto).safeRun();

      expect(notificationInfrastructure.dispatch).toHaveBeenCalledTimes(1);
      expect(notificationInfrastructure.dispatch).toHaveBeenCalledWith(
        NotificationIdentifier.QUERY_SUCCESS,
        [{ subscriberId: query.userId }],
        {
          queryId: query.id,
          queryCode: query.queryCode,
          documentType: query.documentType,
          documentQuery: query.documentQuery,
          queryName: query.refClass,
        },
      );
    });

    test('should create job if query is not failure', async () => {
      const delay: number = 5 * 60 * 1000;

      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce({ webhookUrls: [] } as UserDto);

      await sut.execute(query as QueryDto).safeRun();

      expect(queryJob.createJob).toHaveBeenCalledTimes(1);
      expect(queryJob.createJob).toHaveBeenCalledWith(
        query.id,
        {
          queryId: query.id,
          queryCode: query.queryCode,
          documentType: query.documentType,
          documentQuery: query.documentQuery,
          queryName: query.refClass,
        },
        { delay, removeOnComplete: true },
      );
    });

    test('should not call event notification email if query is not failure', async () => {
      jest.spyOn(userRepository, 'getById').mockResolvedValueOnce({ webhookUrls: [] } as UserDto);

      await sut.execute(query as QueryDto).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(0);
    });

    test('should call email notification if query is failure', async () => {
      const userFirstName: string = user.name.split(' ')[0];

      jest.spyOn(userRepository, 'getById').mockResolvedValue({ ...user, webhookUrls: [] } as UserDto);

      await sut.execute({ ...query, queryStatus: QueryStatus.FAILURE } as QueryDto).safeRun();

      expect(notificationServiceGen.dispatch).toHaveBeenCalledTimes(1);
      expect(notificationServiceGen.dispatch).toHaveBeenCalledWith(
        NotificationTransport.EMAIL,
        NotificationType.QUERY_FAIL,
        {
          email: user.email,
          name: userFirstName,
          queryName: query.refClass,
        },
      );
    });
  });
});
