import { PaymentGatewayType, PaymentStatus, PaymentType } from 'src/domain/_entity/payment.entity';
import { BillingDto } from 'src/domain/_layer/data/dto/billing.dto';
import { ExternalPaymentStateDto } from 'src/domain/_layer/data/dto/payment-response.dto';
import { PaymentDto } from 'src/domain/_layer/data/dto/payment.dto';
import { SyncWithExternalPaymentDomain } from 'src/domain/support/payment/sync-with-external-payment.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';

describe(SyncWithExternalPaymentDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<SyncWithExternalPaymentDomain> = TestSetup.run(SyncWithExternalPaymentDomain);
  const reqParentId: string = 'reqParentId';

  test('Sync pix resource', async () => {
    /** - Setup - */
    const QRCODE: string = 'code';
    const QRCODE_IMAGE: string = 'image';
    const EXTERNAL_STATE: ExternalPaymentStateDto = {
      status: PaymentStatus.PENDING,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: {
        qrcodeText: QRCODE,
        qrcode: QRCODE_IMAGE,
      },
      paidAt: null,
      details: {
        currentGateway: {
          gateway: 'iugu',
          referenceIn: 'gateway_ref',
        },
      },
    };

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'fetchPayment')
      .mockImplementation(async () => EXTERNAL_STATE);

    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      status: PaymentStatus.PENDING,
      type: PaymentType.PIX,
      billingId: insertedBilling.id,
      gateway: PaymentGatewayType.ARC,
      totalPaidInCents: 0,
    });

    /** - Run - */
    const updatedPayment: PaymentDto = await setup.useCase.syncInternal(insertedPayment.id, reqParentId).unsafeRun();

    /** - Test - */
    expect(updatedPayment.totalPaidInCents).toBe(0);
    expect(updatedPayment.pix.qrcode).toBe(QRCODE_IMAGE);
    expect(updatedPayment.pix.qrcodeText).toBe(QRCODE);
    expect(updatedPayment.chargeId).toBe(EXTERNAL_STATE.details.currentGateway.referenceIn);
  });

  test('Sync payment status', async () => {
    /** - Setup - */
    const EXTERNAL_STATE: ExternalPaymentStateDto = {
      status: PaymentStatus.PAID,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: null,
      paidAt: new Date('2020').toISOString(),
      details: {
        currentGateway: {
          gateway: 'iugu',
          referenceIn: 'gateway_ref',
        },
      },
    };

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'fetchPayment')
      .mockImplementation(async () => EXTERNAL_STATE);

    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      type: PaymentType.PIX,
      billingId: insertedBilling.id,
      gateway: PaymentGatewayType.ARC,
      status: PaymentStatus.PENDING,
      totalPaidInCents: 0,
    });

    /** - Run - */
    const updatedPayment: PaymentDto = await setup.useCase.syncInternal(insertedPayment.id, reqParentId).unsafeRun();

    /** - Test - */
    expect(updatedPayment.totalPaidInCents).toBe(insertedPayment.totalPriceWithDiscountInCents);
    expect(updatedPayment.status).toBe(PaymentStatus.PAID);
    expect(updatedPayment.chargeId).toBe(EXTERNAL_STATE.details.currentGateway.referenceIn);
  });

  test('Sync payment status with different gateway', async () => {
    /** - Setup - */
    const EXTERNAL_STATE: ExternalPaymentStateDto = {
      status: PaymentStatus.PAID,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: null,
      paidAt: new Date('2020').toISOString(),
      details: {
        currentGateway: {
          gateway: 'iugu',
          referenceIn: 'gateway_ref',
        },
      },
    };

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'fetchPayment')
      .mockImplementation(async () => EXTERNAL_STATE);

    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      type: PaymentType.PIX,
      billingId: insertedBilling.id,
      gateway: PaymentGatewayType.ARC,
      status: PaymentStatus.PENDING,
      totalPaidInCents: 0,
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
    });

    /** - Run - */
    const updatedPayment: PaymentDto = await setup.useCase.syncInternal(insertedPayment.id, reqParentId).unsafeRun();

    /** - Test - */
    expect(updatedPayment.totalPaidInCents).toBe(insertedPayment.totalPriceWithDiscountInCents);
    expect(updatedPayment.status).toBe(PaymentStatus.PAID);
    expect(updatedPayment.chargeId).toBe(EXTERNAL_STATE.details.currentGateway.referenceIn);
  });

  test('Sync pix resource with external reference', async () => {
    /** - Setup - */
    const QRCODE: string = 'code';
    const QRCODE_IMAGE: string = 'image';
    const EXTERNAL_REFERENCE: string = '::ID::';
    const EXTERNAL_STATE: ExternalPaymentStateDto = {
      status: PaymentStatus.PENDING,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: {
        qrcodeText: QRCODE,
        qrcode: QRCODE_IMAGE,
      },
      paidAt: null,
      details: {
        currentGateway: {
          gateway: 'iugu',
          referenceIn: 'gateway_ref',
        },
      },
    };

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'fetchPayment')
      .mockImplementation(async () => EXTERNAL_STATE);

    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling();
    const payment: PaymentDto = await setup.repositories.payment.insert({
      status: PaymentStatus.PENDING,
      type: PaymentType.PIX,
      billingId: insertedBilling.id,
      gateway: PaymentGatewayType.ARC,
      paymentExternalRef: EXTERNAL_REFERENCE,
      totalPaidInCents: 0,
    });

    /** - Run - */
    const updatedPayment: PaymentDto = await setup.useCase
      .syncWithExternalReference(EXTERNAL_REFERENCE, payment.id, PaymentGatewayType.ARC, reqParentId)
      .unsafeRun();

    /** - Test - */
    expect(updatedPayment.totalPaidInCents).toBe(0);
    expect(updatedPayment.pix.qrcode).toBe(QRCODE_IMAGE);
    expect(updatedPayment.pix.qrcodeText).toBe(QRCODE);
    expect(updatedPayment.paymentExternalRef).toBe(EXTERNAL_REFERENCE);
    expect(updatedPayment.chargeId).toBe(EXTERNAL_STATE.details.currentGateway.referenceIn);
  });

  test('Sync payment status but paid payment is reset to pending', async () => {
    /** - Setup - */
    const EXTERNAL_STATE: ExternalPaymentStateDto = {
      status: PaymentStatus.PENDING,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: null,
      paidAt: new Date('2020').toISOString(),
      details: {
        currentGateway: {
          gateway: 'iugu',
          referenceIn: 'gateway_ref',
        },
      },
    };

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'fetchPayment')
      .mockImplementation(async () => EXTERNAL_STATE);

    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const insertedPayment: PaymentDto = await setup.repositories.payment.insert({
      type: PaymentType.PIX,
      billingId: insertedBilling.id,
      gateway: PaymentGatewayType.ARC,
      status: PaymentStatus.PAID,
    });

    /** - Run - */
    const updatedPayment: PaymentDto = await setup.useCase.syncInternal(insertedPayment.id, reqParentId).unsafeRun();

    /** - Test - */
    expect(updatedPayment.totalPaidInCents).toBe(insertedPayment.totalPriceWithDiscountInCents);
    expect(updatedPayment.status).toBe(PaymentStatus.PAID);
    expect(updatedPayment.chargeId).toBe(EXTERNAL_STATE.details.currentGateway.referenceIn);
  });

  test('Sync pix resource with external reference before `paymentExternalRef` field feat', async () => {
    /** - Setup - */
    const QRCODE: string = 'code';
    const QRCODE_IMAGE: string = 'image';
    const EXTERNAL_REFERENCE: string = '::ID::';
    const EXTERNAL_STATE: ExternalPaymentStateDto = {
      status: PaymentStatus.PENDING,
      bankSlipResource: null,
      creditCardResource: null,
      pixResource: {
        qrcodeText: QRCODE,
        qrcode: QRCODE_IMAGE,
      },
      paidAt: null,
      details: {
        currentGateway: {
          gateway: 'iugu',
          referenceIn: 'gateway_ref',
        },
      },
    };

    jest
      .spyOn(setup.servicesMocks.paymentGatewayService, 'fetchPayment')
      .mockImplementation(async () => EXTERNAL_STATE);

    const insertedBilling: BillingDto = await setup.factory.createDissociatedEmptyBilling();

    const payment: PaymentDto = await setup.repositories.payment.insert({
      status: PaymentStatus.PENDING,
      type: PaymentType.PIX,
      billingId: insertedBilling.id,
      gateway: PaymentGatewayType.ARC,
      chargeId: EXTERNAL_REFERENCE,
      totalPaidInCents: 0,
    });

    /** - Run - */
    const updatedPayment: PaymentDto = await setup.useCase
      .syncWithExternalReference(EXTERNAL_REFERENCE, payment.id, PaymentGatewayType.ARC, reqParentId)
      .unsafeRun();

    /** - Test - */
    expect(updatedPayment.totalPaidInCents).toBe(0);
    expect(updatedPayment.pix.qrcode).toBe(QRCODE_IMAGE);
    expect(updatedPayment.pix.qrcodeText).toBe(QRCODE);
    expect(updatedPayment.paymentExternalRef).toBe(EXTERNAL_REFERENCE);
    expect(updatedPayment.chargeId).toBe(EXTERNAL_STATE.details.currentGateway.referenceIn);
  });
});
