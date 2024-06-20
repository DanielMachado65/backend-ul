import { GetBoughtProductUseCase } from '../get-bought-product.use-case';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { UserRepository } from 'src/domain/_layer/infrastructure/repository/user.repository';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { NoUserFoundDomainError, NotFoundMyCarDomainError } from 'src/domain/_entity/result.error';
import { randomUUID } from 'crypto';

describe(GetBoughtProductUseCase.name, () => {
  let getBoughtProductUseCase: GetBoughtProductUseCase;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  const userId: string = randomUUID();
  const productId: string = randomUUID();
  const billingId: string = randomUUID();

  const mockProduct: MyCarProductDto = {
    billingId: billingId,
    createdAt: new Date().toISOString(),
    deactivatedAt: null,
    deletedAt: null,
    expiresAt: null,
    fineConfig: null,
    id: productId,
    keys: null,
    onQueryConfig: null,
    priceFIPEConfig: null,
    revisionConfig: null,
    status: null,
    subscriptionId: null,
    type: MyCarProductTypeEnum.FREEMIUM,
    updatedAt: new Date().toISOString(),
  };

  const mockUser: UserDto = {
    billingId: billingId,
    createdAt: new Date().toISOString(),
    deletedAt: null,
    email: 'some-email',
    id: userId,
    name: 'some-name',
    cpf: '',
    phoneNumber: '',
    address: null,
    type: null,
    lastLogin: '',
    status: false,
    creationOrigin: null,
    company: null,
    hierarchy: null,
    externalControls: null,
    whenDeletedAt: '',
  };

  beforeEach(() => {
    mockMyCarProductRepository = {
      getByIdAndBillingId: jest.fn((productId: string, billingId: string) => {
        if (productId !== mockProduct.id || billingId !== mockUser.billingId) {
          return null;
        }
        return mockProduct;
      }),
    } as unknown as jest.Mocked<MyCarProductRepository>;

    mockUserRepository = {
      getById: jest.fn((userId: string) => {
        if (userId !== mockUser.id) {
          return null;
        }
        return mockUser;
      }),
    } as unknown as jest.Mocked<UserRepository>;

    getBoughtProductUseCase = new GetBoughtProductUseCase(mockMyCarProductRepository, mockUserRepository);
  });

  describe('getById', () => {
    it('should return a specific bought product for a user', async () => {
      const result: MyCarProductDto = await getBoughtProductUseCase.getById(productId, userId).unsafeRun();

      expect(result).toEqual(mockProduct);
      expect(mockMyCarProductRepository.getByIdAndBillingId).toHaveBeenCalledWith(productId, billingId);
    });

    it('should throw an error if the product is not found', async () => {
      const invalidId: string = randomUUID();
      mockMyCarProductRepository.getByIdAndBillingId.mockResolvedValueOnce(null);

      await expect(getBoughtProductUseCase.getById(invalidId, userId).unsafeRun()).rejects.toThrow(
        NotFoundMyCarDomainError,
      );
    });

    it('should throw an error if the user is not found', async () => {
      mockUserRepository.getById.mockResolvedValueOnce(null);

      await expect(getBoughtProductUseCase.getById(productId, userId).unsafeRun()).rejects.toThrow(
        NoUserFoundDomainError,
      );
    });
  });
});
