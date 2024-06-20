import { Test, TestingModule } from '@nestjs/testing';
import { GetPriceTableProductsUseCase } from 'src/data/support/billing/get-price-table-products.use-case';
import { PriceTableProductDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { PriceTableRepository } from 'src/domain/_layer/infrastructure/repository/price-table.repository';
import {
  GetPriceTableProductsDomain,
  GetPriceTableProductsDomainResult,
} from 'src/domain/support/billing/get-price-table-products.domain';
import { mockPriceTableProductDto } from 'test/mocks/dto/price-table.dto.mock';

describe('GetPriceTableProductsUseCase', () => {
  let sut: GetPriceTableProductsUseCase;
  let module: TestingModule;
  let priceTableRepository: PriceTableRepository;

  const priceTableProducts: ReadonlyArray<PriceTableProductDto> = [mockPriceTableProductDto()];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: GetPriceTableProductsDomain,
          useClass: GetPriceTableProductsUseCase,
        },
        {
          provide: PriceTableRepository,
          useValue: {
            getPriceTableProducts: jest.fn().mockResolvedValue(priceTableProducts),
          },
        },
      ],
    }).compile();

    priceTableRepository = module.get(PriceTableRepository);
  });

  beforeEach(async () => {
    sut = await module.resolve(GetPriceTableProductsDomain);
  });

  test('should call PriceTableRepository.getPriceTableProducts', async () => {
    const products: GetPriceTableProductsDomainResult = await sut.getProducts('any_user_id').safeRun();

    expect(priceTableRepository.getPriceTableProducts).toHaveBeenCalledTimes(1);
    expect(priceTableRepository.getPriceTableProducts).toHaveBeenCalledWith('any_user_id');

    expect(products.getRight()).toStrictEqual(priceTableProducts);
  });
});
