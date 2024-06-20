import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { GetSubscriptionRelatedDataUseCase } from '../get-subscription-related-data.use-case';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { SubscriptionRelatedDataDto } from 'src/domain/_layer/presentation/dto/subscription-output.dto';

describe('GetSubscriptionRelatedDataUseCase', () => {
  let myCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let usecase: GetSubscriptionRelatedDataUseCase;
  const userMock: UserDto = {
    id: '',
  } as unknown as UserDto;

  beforeEach(() => {
    myCarProductRepository = {
      getBySubscriptionId: jest.fn(),
    } as unknown as jest.Mocked<MyCarProductRepository>;

    usecase = new GetSubscriptionRelatedDataUseCase(myCarProductRepository);
  });

  it('Get related data for all subscriptions', async () => {
    const subscriptionsIds: readonly string[] = ['1', '2', '3'];
    myCarProductRepository.getBySubscriptionId.mockImplementation(async (id: string) =>
      subscriptionsIds.indexOf(id) !== -1
        ? ({
            keys: {
              plate: 'XXXXXXX',
            },
          } as MyCarProductDto)
        : null,
    );

    const result: ReadonlyArray<SubscriptionRelatedDataDto> = await usecase
      .fromMultiple(userMock.id, subscriptionsIds)
      .unsafeRun();

    expect(myCarProductRepository.getBySubscriptionId).toHaveBeenCalledTimes(subscriptionsIds.length);

    expect(result).toEqual([{ plate: 'XXXXXXX' }, { plate: 'XXXXXXX' }, { plate: 'XXXXXXX' }]);
  });

  it('Get related data for all subscription that have a my car related, return null if not found', async () => {
    const subscriptionsIds: readonly string[] = ['1', '2', '3'];
    myCarProductRepository.getBySubscriptionId.mockImplementation(async (id: string) =>
      subscriptionsIds.indexOf(id) !== -1 && id !== '2'
        ? ({
            keys: {
              plate: 'XXXXXXX',
            },
          } as MyCarProductDto)
        : null,
    );

    const result: ReadonlyArray<SubscriptionRelatedDataDto> = await usecase
      .fromMultiple(userMock.id, subscriptionsIds)
      .unsafeRun();

    expect(myCarProductRepository.getBySubscriptionId).toHaveBeenCalledTimes(subscriptionsIds.length);

    expect(result).toEqual([{ plate: 'XXXXXXX' }, null, { plate: 'XXXXXXX' }]);
  });
});
