import { BillingDto } from '../../../../domain/_layer/data/dto/billing.dto';
import { PaymentDto } from '../../../../domain/_layer/data/dto/payment.dto';
import { PaymentEmailMarketingDto } from '../../../../domain/_layer/infrastructure/service/marketing.service';
import { SendPaymentToEmailMarketingDomain } from '../../../../domain/support/marketing/send-payment-to-email-marketing.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { TestUtil } from '../../../../infrastructure/repository/test/test.util';
import { UserDto } from '../../../../domain/_layer/data/dto/user.dto';

describe(SendPaymentToEmailMarketingDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<SendPaymentToEmailMarketingDomain> = TestSetup.run(SendPaymentToEmailMarketingDomain);
  const firstName: string = 'Gandalf';
  const lastName: string = 'Gray';
  const itemName: string = 'Veiculo Completa';
  const defaultUserParams: Partial<UserDto> = {
    name: `${firstName} The ${lastName}`,
    email: 'gandalf@email.com',
    phoneNumber: '11998765432',
    createdAt: new Date().toISOString(),
  };

  let spyRegisterPaymentWithDebts: jest.SpyInstance;
  let spyRegisterPaymentWithoutDebts: jest.SpyInstance;

  const mockImplementation: (purchase: string) => (dto: PaymentEmailMarketingDto) => Promise<void> =
    (purchase: string) =>
    (dto: PaymentEmailMarketingDto): Promise<void> => {
      expect(dto.email).toBe(defaultUserParams.email);
      expect(dto.firstName).toBe(firstName);
      expect(dto.lastName).toBe(lastName);
      expect(dto.phone).toBe(defaultUserParams.phoneNumber);
      expect(dto.birthday).toBe(setup.utils.dateTime.fromIso(defaultUserParams.createdAt).format('MM/YY'));
      expect(dto.purchase).toBe(purchase);

      return Promise.resolve(undefined);
    };

  beforeEach(() => {
    spyRegisterPaymentWithDebts = jest
      .spyOn(setup.servicesMocks.markintingService, 'registerUserPaidDebts')
      .mockImplementation(mockImplementation(itemName));
    spyRegisterPaymentWithoutDebts = jest
      .spyOn(setup.servicesMocks.markintingService, 'registerUserPaid')
      .mockImplementation(mockImplementation(''));
  });

  test('Send payment without debts to email marketing', async () => {
    const [, insertedBilling]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      user: defaultUserParams,
    });
    const insertedPayment: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      items: [
        {
          name: itemName,
          amount: 1,
          packageId: null,
          queryId: TestUtil.generateId(),
          signatureId: null,
          totalValueInCents: 4990,
          unitValueInCents: 4990,
        },
      ],
    });

    const hasSent: boolean = await setup.useCase.send(insertedPayment.id).unsafeRun();

    /** - Test - */
    expect(hasSent).toBe(true);
    expect(spyRegisterPaymentWithDebts.mock.calls.length).toBe(0);
    expect(spyRegisterPaymentWithoutDebts.mock.calls.length).toBe(1);
  });

  test('Send payment with to email marketing', async () => {
    const [, insertedBilling]: readonly [UserDto, BillingDto] = await setup.factory.createEmptyUserWithBillingAccount({
      user: defaultUserParams,
    });
    const insertedPayment: PaymentDto = await setup.factory.createBasicPayment({
      billingId: insertedBilling.id,
      items: [],
      debts: {
        installment: {
          fee: 0,
          coupon: '',
          numberOfInstallments: 0,
          monthlyFee: 0,
          priceInCents: 0,
          type: '',
          priceWithInterestInCents: 0,
        },
        items: [
          {
            amountInCents: 0,
            dependsOn: [],
            description: '',
            dueDate: new Date().toISOString(),
            distinct: [],
            externalId: '',
            protocol: '',
            required: false,
            title: '',
          },
        ],
      },
    });

    const hasSent: boolean = await setup.useCase.send(insertedPayment.id).unsafeRun();

    /** - Test - */
    expect(hasSent).toBe(true);
    expect(spyRegisterPaymentWithDebts.mock.calls.length).toBe(1);
    expect(spyRegisterPaymentWithoutDebts.mock.calls.length).toBe(0);
  });
});
