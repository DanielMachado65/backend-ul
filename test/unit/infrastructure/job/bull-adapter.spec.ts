import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { QueryJob } from 'src/domain/_layer/infrastructure/job/query.job';
import { BullAdapter } from 'src/infrastructure/job/bull-adapter';

jest.mock('bullmq');

jest.mock('@nestjs/bullmq', () => ({
  InjectQueue: () => {
    return (): void => {
      return;
    };
  },
}));

describe('BullAdapter', () => {
  let sut: BullAdapter;
  let module: TestingModule;
  let queue: Queue;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: QueryJob,
          useClass: BullAdapter,
        },
        {
          provide: Queue,
          useValue: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    queue = module.get(Queue);
  });

  beforeEach(async () => {
    sut = await module.resolve(QueryJob);
  });

  describe('#createJob', () => {
    const jobName: string = 'any_name';
    const data: object = { any: 'any' };
    const delay: number = 2000;

    test('should throw if  Queue.add throws', async () => {
      const error: Error = new Error('any_error');
      jest.spyOn(queue, 'add').mockRejectedValueOnce(error);
      const promise: Promise<void> = sut.createJob(jobName, data);

      await expect(promise).rejects.toThrow(error);
    });

    test('should call Queue.add', async () => {
      await sut.createJob(jobName, data, { delay, removeOnComplete: true });

      expect(queue.add).toHaveBeenCalledTimes(1);
      expect(queue.add).toHaveBeenCalledWith(jobName, data, { jobId: jobName, delay, removeOnComplete: true });
    });
  });

  describe('#removeJob', () => {
    test('should throw if  Queue.remove throws', async () => {
      const error: Error = new Error('any_error');
      jest.spyOn(queue, 'remove').mockRejectedValueOnce(error);
      const promise: Promise<void> = sut.removeJob('any_id');

      await expect(promise).rejects.toThrow(error);
    });

    test('should call Queue.remove', async () => {
      const jobId: string = 'any_id';
      await sut.removeJob(jobId);

      expect(queue.remove).toHaveBeenCalledTimes(1);
      expect(queue.remove).toHaveBeenCalledWith(jobId, { removeChildren: true });
    });
  });
});
