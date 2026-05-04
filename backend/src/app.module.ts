import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { BriefModule } from './brief/brief.module';
import { AdminModule } from './admin/admin.module';
import { PublicModule } from './public/public.module';
import { SeoModule } from './seo/seo.module';
import { EmailModule } from './email/email.module';
import { RateLimitModule } from './ratelimit/ratelimit.module';
import { HealthController } from './health.controller';

import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { MetricsMiddleware } from './common/middleware/metrics.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RateLimitModule,
    EmailModule,
    AuthModule,
    ConsultationsModule,
    BriefModule,
    PublicModule,
    SeoModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
