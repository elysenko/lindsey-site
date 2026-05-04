import { Module } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { TeamController } from './team.controller';
import { FaqController } from './faq.controller';
import { InsightsController } from './insights.controller';
import { SeoModule } from '../seo/seo.module';

@Module({
  imports: [SeoModule],
  controllers: [ServicesController, TeamController, FaqController, InsightsController],
})
export class PublicModule {}
