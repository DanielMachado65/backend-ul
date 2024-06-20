import { UserCreationOrigin, UserType } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

export const mockUserDto = (): UserDto => ({
  address: {
    city: 'any_mocked_city',
    complement: '',
    neighborhood: '',
    number: '22222',
    state: 'AA',
    street: '',
    zipCode: '',
  },
  billingId: 'any_billing_id',
  company: {
    cnae: '',
    cnpj: '',
    fantasyName: '',
    isNationalSimple: true,
    legalCode: '',
    socialName: '',
    stateSubscription: '',
  },
  cpf: '',
  creationOrigin: UserCreationOrigin.WEBSITE,
  deletedAt: null,
  email: 'user_mocked@mail.com',
  id: 'any_user_mock_id',
  externalControls: {
    arc: {
      id: '',
      tenants: [],
    },
    asaas: {
      id: '',
    },
    iugu: {
      id: '',
    },
  },
  hierarchy: {
    indicatorId: '',
    ownerId: '',
    partnerId: '',
  },
  lastLogin: new Date().toDateString(),
  name: 'any_mocked_name',
  phoneNumber: '999999999',
  status: true,
  type: UserType.PRE_PAID,
  whenDeletedAt: null,
});
