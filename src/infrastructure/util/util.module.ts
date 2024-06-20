import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VehicleUtil } from 'src/infrastructure/util/vehicle.util';
import { EnvService } from '../framework/env.service';
import { ArrayUtil } from './array.util';
import { AuthUtil } from './auth.util';
import { ClassValidatorUtil } from './class-validator.util';
import { CpfUtil } from './cpf.util';
import { CreditCardUtil } from './credit-card.util';
import { CurrencyUtil } from './currency.util';
import { DateTimeUtil } from './date-time-util.service';
import { EncryptionUtil } from './encryption.util';
import { FipeCodeObfuscatorUtil } from './fipe-code-obfuscator.util';
import { BrazilianGreetingUtil, GreetingUtil } from './greeting.util';
import { JwtUtil } from './jwt.util';
import { ObjectUtil } from './object.util';
import { PromiseUtil } from './promise.util';
import { SheetUtil } from './sheet.util';
import { TransitionUtil } from './transition.util';
import { UserAgentUtil } from './user-agent.util';
import { RevisionPlanUtils } from './revision-plan.util';
import { ArcUtil } from './arc.util';

const utils: ReadonlyArray<Provider> = [
  ArrayUtil,
  AuthUtil,
  ClassValidatorUtil,
  CpfUtil,
  CreditCardUtil,
  CurrencyUtil,
  DateTimeUtil,
  EncryptionUtil,
  EnvService,
  JwtUtil,
  ObjectUtil,
  PromiseUtil,
  SheetUtil,
  TransitionUtil,
  UserAgentUtil,
  VehicleUtil,
  FipeCodeObfuscatorUtil,
  RevisionPlanUtils,
  ArcUtil,
  { provide: GreetingUtil, useClass: BrazilianGreetingUtil },
];

@Global()
@Module({
  providers: [...utils, ConfigService],
  exports: [...utils],
})
export class UtilModule {}
