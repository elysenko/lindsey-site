import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SeoModule } from '../seo/seo.module';
import { AdminLeadsController } from './leads/admin-leads.controller';
import { AdminLeadsService } from './leads/admin-leads.service';
import { AdminInsightsController } from './insights/admin-insights.controller';
import { AdminInsightsService } from './insights/admin-insights.service';

@Module({
  imports: [AuthModule, SeoModule],
  controllers: [AdminLeadsController, AdminInsightsController],
  providers: [AdminLeadsService, AdminInsightsService],
})
export class AdminModule {}
