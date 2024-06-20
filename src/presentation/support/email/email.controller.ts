import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { ApiRoles } from '../../../domain/_layer/presentation/roles/api-roles.enum';
import {
  SendPotencialUserEmailDomain,
  SendPotencialUserEmailResult,
} from 'src/domain/support/email/send-potencial-user-email.domain';
import { EmailPotencialUsersInputDto } from 'src/domain/_layer/presentation/dto/email-potencial-users-input.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly _sendPotencialUserEmailDomain: SendPotencialUserEmailDomain) {}

  @Post('/potencial-clients')
  @Roles([ApiRoles.SCHEDULER_QUERY_PROVIDER])
  @ApiOperation({ summary: 'receive email payloads' })
  sendPotencialClients(@Body() body: EmailPotencialUsersInputDto): Promise<SendPotencialUserEmailResult> {
    return this._sendPotencialUserEmailDomain.send(body.to, body.users).safeRun();
  }
}
