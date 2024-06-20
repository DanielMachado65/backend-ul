import { CarRevendorEntity } from 'src/domain/_entity/car-revendor.entity';
import {
  InvalidPostalCodeDomainError,
  PostalCodeNotFoundDomainError,
  ProviderUnavailableDomainError,
  UnknownDomainError,
  UserAlreadyExistsDomainError,
  UserHasWeakPasswordDomainError,
} from 'src/domain/_entity/result.error';
import { TokenEntity } from 'src/domain/_entity/token.entity';
import { UserCreationOrigin } from 'src/domain/_entity/user.entity';
import { PostalCodeInfo, PostalCodeInfoOrigin } from 'src/domain/_layer/data/dto/postal-code-info.dto';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';
import { AddUserDomain, AddUserParams } from 'src/domain/core/user/add-user.domain';
import { TestSetup } from 'src/infrastructure/testing/setup.test';
import { TokenData } from 'src/infrastructure/util/auth.util';
import { ChannelType, ConsentType } from '../../../../domain/_entity/user-consents.entity';
import { DeviceKind } from '../../../../domain/_layer/infrastructure/middleware/device-info.middleware';

describe(AddUserDomain.name, () => {
  /** - Setup - */
  const setup: TestSetup<AddUserDomain> = TestSetup.run(AddUserDomain);
  const reqParentId: string = 'reqParentId';

  beforeEach(async () => {
    jest
      .spyOn(setup.servicesMocks.queryPostalCodeService, 'queryPostalCode')
      .mockImplementation(async (code: string): Promise<PostalCodeInfo> => {
        if (code === '94810001')
          // https://viacep.com.br/ws/94810001/json/ [26/07/2022]
          return {
            city: 'Alvorada',
            neighborhood: 'Bela Vista',
            postalCode: '94810001',
            street: 'Avenida Presidente Getúlio Vargas',
            uf: 'RS',
            complement: '',
            ddd: '',
            __origin__: PostalCodeInfoOrigin.VIACEP,
          };
        else if (code === '11111111') return null;
        else throw null;
      });
  });

  test('Adding user with existing default pricetable', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'Alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const userAdded: TokenEntity = await setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();
    const carVendorCount: number = await setup.repositories.carVendor.count();

    /** - Test - */
    expect(userAdded).toBeDefined();
    expect(carVendorCount).toBe(0);
  });

  test('Adding user with invalid state location', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'alvorad',
        state: 'AA',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const addingUser: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

    /** - Test - */
    await expect(addingUser).rejects.toThrow(InvalidPostalCodeDomainError);
  });

  test('Adding user with non existing CEP', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '11111111', // non existing CEP
        city: 'alvorad',
        state: 'AA',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const addingUser: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

    /** - Test - */
    await expect(addingUser).rejects.toThrow(PostalCodeNotFoundDomainError);
  });

  test('Adding user with name invalid', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'teste @ @@',
      email: 'teste@gmail.com',
      cpf: '',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'Alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const addingUser: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

    /** - Test - */
    await expect(addingUser).rejects.toThrow(UnknownDomainError);
  });

  test('Trying to add user but provider cant validate CEP', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: 'null',
        city: 'alvorad',
        state: 'AA',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const addingUser: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

    /** - Test - */
    await expect(addingUser).rejects.toThrow(ProviderUnavailableDomainError);
  });

  test('Adding user with invalid password', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' });
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'password',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const addingUser: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, '').unsafeRun();

    /** - Test - */
    await expect(addingUser).rejects.toThrow(UserHasWeakPasswordDomainError);
  });

  test('Adding user that already exists', async () => {
    /** - Run - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const userAdded: TokenEntity = await setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();
    const readingUser: Promise<TokenEntity> = setup.useCase
      .addUser(params, DeviceKind.UNKNOWN, reqParentId)
      .unsafeRun();

    /** - Test - */
    expect(userAdded).toBeDefined();
    await expect(readingUser).rejects.toThrow(UserAlreadyExistsDomainError);
  });

  test('Adding user without state that already exists', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'alvorad',
        state: null,
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };

    /** - Run - */
    const userAdded: TokenEntity = await setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

    /** - Test - */
    const insertedUser: UserDto = await setup.repositories.user.getByEmail(params.email);
    expect(userAdded).toBeDefined();
    expect(insertedUser.address.state).toBe('RS');
  });

  // TODO: UNDO THIS MARK COMMENT BECAUSE OF VERIFY USER WAS COMMENT
  // test('Adding user with invalid name for gateway', async () => {
  //   /** - Setup - */
  //   const MSG_ERROR: string = 'FAIL';

  //   await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
  //   const params: AddUserParams = {
  //     name: 'test@user',
  //     email: 'test@domain.com',
  //     cpf: '12345678900',
  //     password: 'Password123@',
  //     phoneNumber: '00123456789',
  //     address: {
  //       zipCode: '94810001', // Real CEP
  //       city: 'Alvorada',
  //       state: 'RS',
  //       neighborhood: 'Bela Vista',
  //       street: 'avenida presidente getulio vargas',
  //       complement: null,
  //       number: '1000',
  //     },
  //     creationOrigin: UserCreationOrigin.UNKNOWN,
  //     consents: [
  //       {
  //         channelType: ChannelType.EMAIL,
  //         consentType: ConsentType.NEWS,
  //         hasGivenConsent: true,
  //       },
  //     ],
  //   };

  //   jest
  //     .spyOn(setup.servicesMocks.paymentGatewayService, 'validateUser')
  //     .mockImplementation(async () => ({ isValid: false, errorMsg: MSG_ERROR }));

  //   /** - Run - */
  //   const userAdding: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

  //   /** - Test - */
  //   await expect(userAdding).rejects.toEqual(new ValidationErrorDomainError(MSG_ERROR));
  // });

  test('Adding user that is a car vendor', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'Alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
      isCarRevendor: true,
    };

    /** - Run - */
    const userAdded: TokenEntity = await setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();
    const tokenData: TokenData = await setup.utils.auth.verifyToken(userAdded.token);
    const carVendor: CarRevendorEntity = await setup.repositories.carVendor.getByUserId(tokenData.id);

    /** - Test - */
    expect(userAdded).toBeDefined();
    expect(carVendor.status).toBe(true);
  });

  test('Adding user that is NOT a car vendor', async () => {
    /** - Setup - */
    await setup.factory.createEmptyPriceTable({ name: 'default' }); // default
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'Alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
      isCarRevendor: false,
    };

    /** - Run - */
    const userAdded: TokenEntity = await setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();
    const tokenData: TokenData = await setup.utils.auth.verifyToken(userAdded.token);
    const carVendor: CarRevendorEntity = await setup.repositories.carVendor.getByUserId(tokenData.id);

    /** - Test - */
    expect(userAdded).toBeDefined();
    expect(carVendor.status).toBe(false);
  });

  /** Shouldn't be possible */
  test('Adding user without existing pricetable', async () => {
    /** - Run - */
    const params: AddUserParams = {
      name: 'Test User',
      email: 'test@domain.com',
      cpf: '12345678900',
      password: 'Password123@',
      phoneNumber: '00123456789',
      address: {
        zipCode: '94810001', // Real CEP
        city: 'alvorada',
        state: 'RS',
        neighborhood: 'Bela Vista',
        street: 'avenida presidente getulio vargas',
        complement: null,
        number: '1000',
      },
      creationOrigin: UserCreationOrigin.UNKNOWN,
      consents: [
        {
          channelType: ChannelType.EMAIL,
          consentType: ConsentType.NEWS,
          hasGivenConsent: true,
        },
      ],
    };
    const addingUser: Promise<TokenEntity> = setup.useCase.addUser(params, DeviceKind.UNKNOWN, reqParentId).unsafeRun();

    /** - Test - */
    await expect(addingUser).rejects.toThrow(UnknownDomainError); // could be specific error
  });
});
