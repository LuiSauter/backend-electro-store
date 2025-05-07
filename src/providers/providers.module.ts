import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators/modules/global.decorator';

import { HttpCustomService } from './http/http.service';
import { LocalStorageService } from './local-storage/local-storage.service';
// import { EmailService } from './email/email.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [HttpCustomService,/**EmailService*/ LocalStorageService],
  exports: [HttpCustomService, HttpModule, /**EmailService*/ LocalStorageService],
})
export class ProvidersModule { }
