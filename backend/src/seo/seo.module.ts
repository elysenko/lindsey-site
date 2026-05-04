import { Module } from '@nestjs/common';
import { JsonLdService } from './jsonld.service';
import { SitemapController } from './sitemap.controller';
import { RobotsController } from './robots.controller';
import { SitemapCacheService } from './sitemap-cache.service';

@Module({
  controllers: [SitemapController, RobotsController],
  providers: [JsonLdService, SitemapCacheService],
  exports: [JsonLdService, SitemapCacheService],
})
export class SeoModule {}
