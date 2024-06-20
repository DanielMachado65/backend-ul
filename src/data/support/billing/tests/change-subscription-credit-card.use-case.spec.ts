import { SubscriptionRepository } from 'src/domain/_layer/infrastructure/repository/subscription.repository';
import { ChangeSubscriptionCreditCardUseCase } from '../change-subscription-credit-card.use-case';
import { PaymentGatewayService } from 'src/domain/_layer/infrastructure/service/payment-gateway.service';
import { SubscriptionDto } from 'src/domain/_layer/data/dto/subscription.dto';
import {
  ExternalSubscriptionDto,
  ExternalSubscriptionStatus,
} from 'src/domain/_layer/data/dto/external-subscription.dto';
import { SubscriptionOutputDto } from 'src/domain/_layer/presentation/dto/subscription-output.dto';
import { ProviderUnavailableDomainError } from 'src/domain/_entity/result.error';
import { GetSubscriptionRelatedDataHelper } from '../get-subscription-related-data.helper';
import { EnvService } from 'src/infrastructure/framework/env.service';
import { MyCarProductRepository } from 'src/domain/_layer/infrastructure/repository/my-car-product.repository';
import { MyCarProductDto } from 'src/domain/_layer/data/dto/my-car-product.dto';

describe('', () => {
  let subscriptionRepository: jest.Mocked<SubscriptionRepository>;
  let paymentGatewayService: jest.Mocked<PaymentGatewayService>;
  let getSubscriptionRelatedDataHelper: GetSubscriptionRelatedDataHelper;
  let envService: jest.Mocked<EnvService>;
  let usecase: ChangeSubscriptionCreditCardUseCase;
  let myCarProductRepository: jest.Mocked<MyCarProductRepository>;
  const cnpj: string = 'cnpj';
  const subscriptionMock: SubscriptionDto = {
    id: 'sub-id',
    gatewayRef: 'ref',
  } as unknown as SubscriptionDto;
  const myCarMock: MyCarProductDto = {
    subscriptionId: subscriptionMock.id,
    keys: {
      plate: 'plate',
    },
  } as unknown as MyCarProductDto;

  beforeEach(() => {
    subscriptionRepository = {
      getByIdOwnedByUser: jest.fn(),
    } as unknown as jest.Mocked<SubscriptionRepository>;
    paymentGatewayService = {
      changeCreditCardSubscription: jest.fn(),
    } as unknown as jest.Mocked<PaymentGatewayService>;
    myCarProductRepository = {
      getBySubscriptionId: jest.fn(() => myCarMock),
    } as unknown as jest.Mocked<MyCarProductRepository>;
    getSubscriptionRelatedDataHelper = new GetSubscriptionRelatedDataHelper(myCarProductRepository);
    envService = {
      get: jest.fn(() => cnpj),
    } as unknown as jest.Mocked<EnvService>;

    usecase = new ChangeSubscriptionCreditCardUseCase(
      subscriptionRepository,
      paymentGatewayService,
      envService,
      getSubscriptionRelatedDataHelper,
    );
  });

  it('Change normally subscription credit card', async () => {
    const userId: string = 'user-id';
    const cardRef: string = 'card-1';
    const newCarRef: string = 'card-2';
    const expiresAt: string = new Date(500).toISOString();
    subscriptionRepository.getByIdOwnedByUser.mockImplementation(async () => subscriptionMock);
    paymentGatewayService.changeCreditCardSubscription.mockImplementation(
      async () =>
        ({
          status: ExternalSubscriptionStatus.CANCELLED,
          expiresAt,
          creditCard: {
            id: newCarRef,
            lastFourDigits: '1111',
          },
          creditCardRef: newCarRef,
        } as ExternalSubscriptionDto),
    );

    const result: SubscriptionOutputDto = await usecase
      .changeBySubscriptionId(subscriptionMock.id, cardRef, userId)
      .unsafeRun();

    expect(subscriptionRepository.getByIdOwnedByUser).toBeCalledWith(subscriptionMock.id, userId);
    expect(paymentGatewayService.changeCreditCardSubscription).toBeCalledWith(
      subscriptionMock.gatewayRef,
      userId,
      cardRef,
      cnpj,
    );

    expect(result).toEqual({
      relatedData: { plate: 'plate' },
      creditCardLast4: '1111',
      creditCardId: newCarRef,
      id: subscriptionMock.id,
      userId: subscriptionMock.userId,
      status: subscriptionMock.status,
      planTag: subscriptionMock.planTag,
      lastChargeInCents: 0,
      deactivatedAt: subscriptionMock.deactivatedAt,
      nextChargeAt: subscriptionMock.nextChargeAt,
      expiresAt: subscriptionMock.expiresAt,
      createdAt: subscriptionMock.createdAt,
      updatedAt: subscriptionMock.updatedAt,
    });
  });

  it('Try to change subscription credit card but gateway fails', async () => {
    const userId: string = 'user-id';
    const cardRef: string = 'card-1';
    subscriptionRepository.getByIdOwnedByUser.mockImplementation(async () => subscriptionMock);
    paymentGatewayService.changeCreditCardSubscription.mockRejectedValue(null);

    const toResolve: Promise<unknown> = usecase
      .changeBySubscriptionId(subscriptionMock.id, cardRef, userId)
      .unsafeRun();
    await expect(toResolve).rejects.toThrow(ProviderUnavailableDomainError);

    expect(subscriptionRepository.getByIdOwnedByUser).toBeCalledWith(subscriptionMock.id, userId);
    expect(paymentGatewayService.changeCreditCardSubscription).toBeCalledWith(
      subscriptionMock.gatewayRef,
      userId,
      cardRef,
      cnpj,
    );
  });
});
