import { Module, Provider } from '@nestjs/common';
import { AuthHelper } from './auth.helper';
import { SignInUseCase } from 'src/data/support/auth/sign-in.use-case';
import { SignInDomain } from 'src/domain/support/auth/sign-in.domain';
import { PasswordRecoveryDomain } from '../../../domain/support/auth/password-recovery.domain';
import { PasswordRecoveryUseCase } from './password-recovery.use-case';
import { PasswordChangeDomain } from '../../../domain/support/auth/password-change.domain';
import { PasswordChangeUseCase } from './password-change.use-case';
import { RecheckUserAuthDomain } from 'src/domain/support/auth/recheck-user-auth.domain';
import { RecheckUserAuthUseCase } from './recheck-user-auth.use-case';

const signInProvider: Provider = {
  provide: SignInDomain,
  useClass: SignInUseCase,
};

const passwordRecoveryProvider: Provider = {
  provide: PasswordRecoveryDomain,
  useClass: PasswordRecoveryUseCase,
};

const passwordChangeProvider: Provider = {
  provide: PasswordChangeDomain,
  useClass: PasswordChangeUseCase,
};

const recheckUserAuthProvider: Provider = {
  provide: RecheckUserAuthDomain,
  useClass: RecheckUserAuthUseCase,
};

@Module({
  imports: [],
  controllers: [],
  providers: [AuthHelper, signInProvider, passwordRecoveryProvider, passwordChangeProvider, recheckUserAuthProvider],
  exports: [AuthHelper, signInProvider, passwordRecoveryProvider, passwordChangeProvider, recheckUserAuthProvider],
})
export class AuthDataLayerModule {}
