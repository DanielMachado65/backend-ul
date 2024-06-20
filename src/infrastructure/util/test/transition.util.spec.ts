import { TransitionRule, TransitionUtil } from '../transition.util';

describe(TransitionUtil.name, () => {
  const transitionUtil: TransitionUtil = new TransitionUtil();

  enum PaymentStatus {
    NEW = 'NEW',
    PENDING = 'PENDING',
    PAID = 'PAID',
    UNPAID = 'UNPAID',
  }

  const transitionRule: TransitionRule<PaymentStatus, PaymentStatus> = [
    { value: PaymentStatus.NEW, allow: [], negate: true },
    { value: PaymentStatus.PENDING, allow: [PaymentStatus.PAID, PaymentStatus.UNPAID] },
    { value: PaymentStatus.PAID, allow: [] },
  ];

  test('status NEW to PENDING', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.NEW;
    const after: PaymentStatus = PaymentStatus.PENDING;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(true);
  });

  test('status NEW to PAID', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.NEW;
    const after: PaymentStatus = PaymentStatus.PAID;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(true);
  });

  test('status NEW to UNPAID', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.NEW;
    const after: PaymentStatus = PaymentStatus.UNPAID;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(true);
  });

  test('status PENDING to NEW', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.PENDING;
    const after: PaymentStatus = PaymentStatus.NEW;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(false);
  });

  test('status PENDING to PAID', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.PENDING;
    const after: PaymentStatus = PaymentStatus.PAID;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(true);
  });

  test('status PENDING to UNPAID', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.PENDING;
    const after: PaymentStatus = PaymentStatus.UNPAID;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(true);
  });

  test('status PAID to PENDING', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.PAID;
    const after: PaymentStatus = PaymentStatus.PENDING;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(false);
  });

  test('status PAID to NEW', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.PAID;
    const after: PaymentStatus = PaymentStatus.NEW;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(false);
  });

  test('status UNPAID to PENDING', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.UNPAID;
    const after: PaymentStatus = PaymentStatus.PENDING;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(false);
  });

  test('status UNPAID to NEW', () => {
    /** - Setup - */
    const before: PaymentStatus = PaymentStatus.UNPAID;
    const after: PaymentStatus = PaymentStatus.NEW;

    /** - Run - */
    const isValid: boolean = transitionUtil.validateTransition(before, after, transitionRule);

    /** - Test - */
    expect(isValid).toBe(false);
  });
});
