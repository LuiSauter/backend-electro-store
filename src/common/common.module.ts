import { Module } from '@nestjs/common';
import { LogsModule } from './binnacle/logs.module';

@Module({
  imports: [LogsModule],
  exports: [LogsModule]
})
export class CommonModule {}
