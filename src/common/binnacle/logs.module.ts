import { Module, Global } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { UsersModule } from 'src/users/users.module';
// import { ReportService } from '@/reports/report.service';

@Global()
@Module({
  providers: [LogsService],

  imports: [UsersModule],
  controllers: [LogsController],
  exports: [LogsService]
})
export class LogsModule { }