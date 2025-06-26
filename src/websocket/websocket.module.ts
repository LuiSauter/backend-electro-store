import { Global, Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

@Global()
@Module({
  imports: [
    // SheetService
  ],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class GatewayModule {}
