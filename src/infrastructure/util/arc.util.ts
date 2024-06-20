import { Injectable } from '@nestjs/common';
import { UserExternalArcTenantControl } from 'src/domain/_entity/user.entity';
import { UserDto } from 'src/domain/_layer/data/dto/user.dto';

/** TODO: this shouldn't exists actually, should only be on the service side */
@Injectable()
export class ArcUtil {
  getUserArcRef(user: UserDto, cnpj: string): string | null {
    return (
      user.externalControls.arc.tenants.find((tenant: UserExternalArcTenantControl) => tenant.cnpj === cnpj)?.id || null
    );
  }

  verifyIfUserHasIdForTenant(user: UserDto, cnpj: string): boolean {
    return (
      user.externalControls.arc.tenants.findIndex((tenant: UserExternalArcTenantControl) => tenant.cnpj === cnpj) !== -1
    );
  }
}
