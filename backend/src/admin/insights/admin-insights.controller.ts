import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminInsightsService } from './admin-insights.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import {
  CreateInsightDto,
  UpdateInsightDto,
} from './dto/upsert-insight.dto';

@Controller('admin/insights')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminInsightsController {
  constructor(private readonly insights: AdminInsightsService) {}

  @Post()
  create(@Body() dto: CreateInsightDto) {
    return this.insights.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsightDto) {
    return this.insights.update(id, dto);
  }
}
