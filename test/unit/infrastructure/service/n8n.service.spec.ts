import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AutomateData, AutomateEnum, AutomateService } from 'src/domain/_layer/infrastructure/service/automate.service';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { N8NService } from 'src/infrastructure/service/n8n.service';

jest.mock('rxjs', () => ({
  firstValueFrom: (): string => '',
}));

describe('N8NService', () => {
  let sut: N8NService;
  let module: TestingModule;
  let httpService: HttpService;

  const baseUrl: string = 'http://base-url';
  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: AutomateService,
          useClass: N8NService,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue(baseUrl),
          },
        },
      ],
    }).compile();

    sut = await module.resolve(AutomateService);
  });

  beforeEach(() => {
    httpService = module.get(HttpService);
  });

  describe('#dispatch', () => {
    test('should call http post one time with paylaod and REVIEW param', async () => {
      const data: AutomateData = { value1: 1, value2: 2 };
      await sut.dispatch(AutomateEnum.REVIEW, data);

      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith(baseUrl + '/efa62ea4-249f-4641-af12-766fdd374b84', {
        type: AutomateEnum.REVIEW,
        ...data,
      });
    });

    test('should call http post one time with paylaod and QUERY_DATA param', async () => {
      const data: AutomateData = { value1: 1, value2: 2 };
      await sut.dispatch(AutomateEnum.QUERY_DATA, data);

      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith(baseUrl + '/efa62ea4-249f-4641-af12-766fdd374b84', {
        type: AutomateEnum.QUERY_DATA,
        ...data,
      });
    });

    test('should call http post one time with paylaod and USER_CREATED param', async () => {
      const data: AutomateData = { value1: 1, value2: 2 };
      await sut.dispatch(AutomateEnum.USER_CREATED, data);

      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith(baseUrl + '/efa62ea4-249f-4641-af12-766fdd374b84', {
        type: AutomateEnum.USER_CREATED,
        ...data,
      });
    });

    test('should call http post one time with paylaod and USER_CREATED param', async () => {
      const data: AutomateData = { value1: 1, value2: 2 };
      await sut.dispatch(AutomateEnum.PAYMENT, data);

      expect(httpService.post).toHaveBeenCalledTimes(1);
      expect(httpService.post).toHaveBeenCalledWith(baseUrl + '/efa62ea4-249f-4641-af12-766fdd374b84', {
        type: AutomateEnum.PAYMENT,
        ...data,
      });
    });
  });
});
