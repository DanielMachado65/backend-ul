import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedbackDomain, FeedbackResult } from 'src/domain/support/feedback/feedback.domain';
import { GetFeedbackDomain, GetFeedbackResult } from 'src/domain/support/feedback/get-feedback.domain';
import { FeedbackInputDto, GetFeedbackDto } from 'src/domain/_layer/presentation/dto/feedback-query-input.dto';
import { Roles } from 'src/infrastructure/guard/roles.guard';
import { UserInfo } from 'src/infrastructure/middleware/user-info.middleware';
import { UserRoles } from '../../../domain/_layer/presentation/roles/user-roles.enum';

@ApiBearerAuth()
@ApiTags('Feedback')
@Controller(['/feedback', '/query-feedback'])
export class FeedbackContoller {
  constructor(
    private readonly _feedbackDomain: FeedbackDomain,
    private readonly _getFeedbackDomain: GetFeedbackDomain,
  ) {}

  @Get('/:queryId')
  @Roles([UserRoles.REGULAR])
  @ApiOperation({ summary: 'Get feedback by queryId' })
  getFeedback(@UserInfo() userInfo: UserInfo, @Param() query: GetFeedbackDto): Promise<GetFeedbackResult> {
    return this._getFeedbackDomain.getFeedback(userInfo.maybeUserId, query.queryId).safeRun();
  }

  @Put()
  @Roles([UserRoles.REGULAR])
  @ApiOperation({ summary: 'Send feedback, if not exits create then' })
  feedbackQuery(@UserInfo() userInfo: UserInfo, @Body() inputDto: FeedbackInputDto): Promise<FeedbackResult> {
    return this._feedbackDomain
      .sendFeedback(userInfo.maybeUserId, inputDto.queryId, inputDto.evaluation, inputDto.description)
      .safeRun();
  }
}
