import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { ListAllBoughtProductUseCase } from '../list-all-bought-product.use-case';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';
import { MyCarProductEntity, MyCarProductTypeEnum } from 'src/domain/_entity/my-car-product.entity';
import { PaginationOf } from 'src/domain/_layer/data/dto/pagination.dto';

describe(ListAllBoughtProductUseCase.name, () => {
  let listAllBoughtProductUseCase: ListAllBoughtProductUseCase;
  let mockMyCarProductRepository: jest.Mocked<MyCarProductRepository>;
  const userId: string = 'some-user-id';
  const pagination: {
    readonly page: number;
    readonly perPage: number;
  } = { page: 1, perPage: 10 };
  let mockProducts: readonly MyCarProductDto[] = [
    {
      billingId: '1',
      createdAt: new Date().toISOString(),
      deactivatedAt: null,
      deletedAt: null,
      expiresAt: null,
      fineConfig: null,
      id: 'some-id',
      keys: null,
      onQueryConfig: null,
      priceFIPEConfig: null,
      revisionConfig: null,
      status: null,
      subscriptionId: null,
      type: MyCarProductTypeEnum.FREEMIUM,
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    mockMyCarProductRepository = {
      listByUserId: jest.fn(),
    } as unknown as jest.Mocked<MyCarProductRepository>;

    listAllBoughtProductUseCase = new ListAllBoughtProductUseCase(mockMyCarProductRepository);
  });

  describe('listAll', () => {
    it('should return a list of bought products for a user', async () => {
      mockMyCarProductRepository.listByUserId.mockResolvedValue({
        items: mockProducts,
        count: mockProducts.length,
        amountInThisPage: mockProducts.length,
        currentPage: pagination.page,
        totalPages: 1,
        itemsPerPage: pagination.perPage,
        nextPage: null,
        previousPage: null,
      });

      const result: PaginationOf<MyCarProductEntity> = await listAllBoughtProductUseCase
        .listAll(userId, pagination.page, pagination.perPage)
        .unsafeRun();

      expect(result.items).toEqual(mockProducts);
      expect(result.count).toEqual(mockProducts.length);
    });

    it('should return an empty list if no products are found', async () => {
      mockProducts = [];
      mockMyCarProductRepository.listByUserId.mockResolvedValue({
        items: [],
        count: mockProducts.length,
        amountInThisPage: mockProducts.length,
        currentPage: pagination.page,
        totalPages: 1,
        itemsPerPage: pagination.perPage,
        nextPage: null,
        previousPage: null,
      });

      const result: PaginationOf<MyCarProductEntity> = await listAllBoughtProductUseCase
        .listAll(userId, pagination.page, pagination.perPage)
        .unsafeRun();

      expect(result.items).toEqual([]);
      expect(result.count).toEqual(0);
    });
  });
});
