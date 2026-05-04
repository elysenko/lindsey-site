import { Global, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailQueueWorker } from './email-queue.worker';

@Global()
@Module({
  providers: [EmailService, EmailQueueWorker],
  exports: [EmailService],
})
export class EmailModule {}
