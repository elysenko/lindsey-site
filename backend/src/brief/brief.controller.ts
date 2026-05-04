import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BriefService } from './brief.service';
import { UpsertBriefDto } from './dto/upsert-brief.dto';

@Controller('brief')
export class BriefController {
  constructor(private readonly brief: BriefService) {}

  @Get(':token')
  async get(@Param('token') token: string) {
    return this.brief.getByToken(token);
  }

  @Post(':token')
  async submit(@Param('token') token: string, @Body() dto: UpsertBriefDto) {
    return this.brief.upsert(token, dto);
  }
}
