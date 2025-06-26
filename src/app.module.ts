import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceConfig } from './config/data.source';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProvidersModule } from './providers/providers.module';
import { CommonModule } from './common/common.module';
import { SeederModule } from './seeder/seeder.module';
import { InventoryModule } from './inventory/inventory.module';
import { FileModule } from './file/file.module';
import { BuyModule } from './buy/buy.module';
import { SaleModule } from './sales/sales.module';
import { GatewayModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),

    GatewayModule,
    ProvidersModule,
    CommonModule,

    AuthModule,
    UsersModule,
    InventoryModule,
    BuyModule,
    SaleModule,

    FileModule,
    SeederModule,
  ]
})
export class AppModule { }
