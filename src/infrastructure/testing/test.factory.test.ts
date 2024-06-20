import { BillingType } from 'src/domain/_entity/billing.entity';
import { QueryDocumentType } from 'src/domain/_entity/query.entity';
import { TestDriveQueryDocumentType } from 'src/domain/_entity/test-drive-query.entity';
import { UserCreationOrigin, UserType } from 'src/domain/_entity/user.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { CityZipCodeDto } from 'src/domain/_layer/data/dto/city-zipcode.dto';
import { ConsumptionStatementDto } from 'src/domain/_layer/data/dto/consumption-statement.dto';
import { PackageDto } from 'src/domain/_layer/data/dto/package.dto';
import { PriceTableDto } from 'src/domain/_layer/data/dto/price-table.dto';
import { QueryComposerDto } from 'src/domain/_layer/data/dto/query-composer.dto';
import { QueryDto } from 'src/domain/_layer/data/dto/query.dto';
import { ServiceDto } from 'src/domain/_layer/data/dto/service.dto';
import { TestDriveQueryDto } from 'src/domain/_layer/data/dto/test-drive-query.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { PaymentGatewayType, PaymentStatus, PaymentType } from '../../domain/_entity/payment.entity';
import { CouponDto } from '../../domain/_layer/data/dto/coupon.dto';
import { PaymentDto } from '../../domain/_layer/data/dto/payment.dto';
import { TestUtil } from '../repository/test/test.util';
import { ISetupRepository } from './setup.test';

// eslint-disable-next-line @typescript-eslint/ban-types
type ManyExecutor<Class extends Object> = {
  readonly [Method in keyof Class as Class[Method] extends (...args: readonly unknown[]) => Promise<unknown>
    ? Method
    : never]: Class[Method] extends (...args: infer Args) => Promise<infer Return>
    ? (...args: Args) => Promise<ReadonlyArray<Return>>
    : never;
};

export class TestFactory {
  private _currentToBeUsedVariant: number = 0;

  constructor(private readonly _repositories: ISetupRepository) {}

  private _getVariant(): number {
    const variant: number = this._currentToBeUsedVariant;

    this._currentToBeUsedVariant += 1;

    return variant;
  }

  __generateMany__(quantity: number): ManyExecutor<TestFactory> {
    type Func = (...args: readonly unknown[]) => Promise<unknown>;

    const many: Record<string, unknown> = {};
    // eslint-disable-next-line functional/prefer-readonly-type
    const methods: Set<string> = new Set(Object.getOwnPropertyNames(TestFactory.prototype));
    methods.delete('constructor');
    methods.delete('many');

    for (const methodName of methods) {
      const method: Func = (this as Record<string, unknown>)[methodName] as Func;
      const bindedMethod: Func = method.bind(this);
      const newMethod = (...args: readonly unknown[]): Promise<ReadonlyArray<unknown>> => {
        // eslint-disable-next-line functional/prefer-readonly-type
        const resolvers: Array<Promise<unknown>> = [];

        for (let index: number = 0; index < quantity; index++) {
          // eslint-disable-next-line functional/immutable-data
          resolvers.push(bindedMethod(...args));
        }

        return Promise.all(resolvers);
      };

      // eslint-disable-next-line functional/immutable-data
      many[methodName] = newMethod.bind(this);
    }

    return many as ManyExecutor<TestFactory>;
  }

  createUserWithOnlyRequirements(partial: Partial<UserDto> = {}): Promise<UserDto> {
    const variant: number = this._getVariant();

    return this._repositories.user.insert({
      cpf: `${variant}`,
      password: 'default',
      type: UserType.MASTER,
      creationOrigin: UserCreationOrigin.WEBSITE,
      ...partial,
    });
  }

  createEmptyPriceTable(priceTable: Partial<PriceTableDto> = {}): Promise<PriceTableDto> {
    const variant: number = this._getVariant();

    return this._repositories.priceTable.insert({
      name: `priceTable${variant}`,
      template: [],
      creatorId: null,
      ...priceTable,
    });
  }

  createEmptyQuery(query: Partial<QueryDto> = {}): Promise<QueryDto> {
    const variant: number = this._getVariant();

    return this._repositories.query.insert({
      queryCode: variant,
      refClass: `Nome Consulta ${variant}`,
      documentType: QueryDocumentType.PLATE,
      ...query,
    });
  }

  createEmptyPackage(pack: Partial<PackageDto> = {}): Promise<PackageDto> {
    const variant: number = this._getVariant();

    return this._repositories.package.insert({
      name: `Package ${variant}`,
      ...pack,
    });
  }

  async createEmptyUserWithBillingAccount({
    user: userParams,
    billing: billingParams,
  }: {
    readonly user?: Partial<UserDto>;
    readonly billing?: Partial<BillingDto>;
  } = {}): Promise<readonly [UserDto, BillingDto]> {
    const user: UserDto = await this.createUserWithOnlyRequirements(userParams);

    const billing: BillingDto = await this.createDissociatedEmptyBilling({ userId: user.id, ...billingParams });

    const updatedUser: UserDto = await this._repositories.user.updateById(user.id, { billingId: billing.id });

    return [updatedUser, billing];
  }

  createDissociatedEmptyBilling(billingParams: Partial<BillingDto> = {}): Promise<BillingDto> {
    return this._repositories.billing.insert({
      billingType: BillingType.PRE_PAID,
      ...billingParams,
    });
  }

  createEmptyConsumptionStatement(conParams: Partial<ConsumptionStatementDto> = {}): Promise<ConsumptionStatementDto> {
    return this._repositories.consumptionStatement.insert({
      queryCode: 1,
      ...conParams,
    });
  }

  createEmptyQueryComposer(qcParams: Partial<QueryComposerDto> = {}): Promise<QueryComposerDto> {
    const variant: number = this._getVariant();

    return this._repositories.queryComposer.insert({
      queryCode: variant,
      ...qcParams,
    });
  }

  createEmptyService(serviceParams: Partial<ServiceDto> = {}): Promise<ServiceDto> {
    const variant: number = this._getVariant();

    return this._repositories.service.insert({
      code: variant,
      ...serviceParams,
    });
  }

  createBasicCoupon(couponParams: Partial<CouponDto> = {}): Promise<CouponDto> {
    const variant: number = this._getVariant();

    return this._repositories.coupon.insert({
      status: true,
      code: `COUPON-${variant}`,
      rules: {
        limitUsage: 1,
        usageMaxToUser: 1,
        minValueToApplyInCents: 100,
        discountPercentage: 1,
        discountValueInCents: 1,
        expirationDate: null,
        authorized: {
          packages: [],
          queries: [],
          signatures: [],
        },
      },
      ...couponParams,
    });
  }

  createBasicPayment(paymentParams: Partial<PaymentDto> = {}): Promise<PaymentDto> {
    const variant: number = this._getVariant();
    const currentDate: Date = new Date();

    return this._repositories.payment.insert({
      chargeId: `CHARGE-${variant}`,
      type: PaymentType.PIX,
      paid: true,
      gateway: PaymentGatewayType.ARC,
      status: PaymentStatus.PENDING,
      realPriceInCents: 4990,
      totalPaidInCents: 4990,
      totalPriceInCents: 4990,
      totalPriceWithDiscountInCents: 4990,
      refMonth: currentDate.getMonth(),
      refYear: currentDate.getFullYear(),
      paymentDate: currentDate.toISOString(),
      createdAt: currentDate.toISOString(),
      items: [
        {
          name: 'Consulta de Veículo Completa',
          amount: 1,
          packageId: null,
          queryId: TestUtil.generateId(),
          signatureId: null,
          totalValueInCents: 4990,
          unitValueInCents: 4990,
        },
      ],
      gatewayDetails: {
        arc: {
          gatewayHistory: {
            mercado_pago: {
              referenceIn: '_',
              createdAt: new Date().toISOString(),
            },
          },
        },
      },
      bankingBillet: {
        barcode: `BARCODE-${variant}`,
        link: `https://banking-billet.link/${variant}`,
        expireAt: currentDate.toISOString(),
      },
      creditCard: {
        installments: 1,
        installmentValueInCents: 4990,
        token: 'token',
      },
      pix: {
        qrcodeText: `PIX-${variant}`,
        qrcode: `QRCODE-${variant}`,
      },
      debts: {
        items: [],
        installment: null,
      },
      ...paymentParams,
    });
  }

  createBasicCityZipCode(params: Partial<CityZipCodeDto> = {}): Promise<CityZipCodeDto> {
    const city: string = params.city || 'São Paulo';
    const cityNormalized: string = city
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase();

    return this._repositories.cityZipCode.insert({
      city: cityNormalized,
      state: params.state || 'SP',
      zipcode: params.zipcode || '12312123',
    });
  }

  createEmptyTestDrive(params: Partial<TestDriveQueryDto> = {}): Promise<TestDriveQueryDto> {
    const variant: number = this._getVariant();

    return this._repositories.testDriveQuery.insert({
      queryCode: variant,
      refClass: `Nome Consulta ${variant}`,
      documentType: TestDriveQueryDocumentType.PLATE,
      ...params,
    });
  }
}
