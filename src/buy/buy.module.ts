import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderEntity } from './entities/providers.entity';
import { BuyDetailEntity, BuyEntity } from './entities/buy.entity';
import { BuyNoteService } from './services/buy.service';
import { ProvidersService } from './services/provider.service';
import { BuyNoteController } from './controllers/buy.controller';
import { ProvidersController } from './controllers/provider.controller';
import { UsersModule } from 'src/users/users.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderEntity,
      BuyEntity,
      BuyDetailEntity
    ]),
    UsersModule,
    InventoryModule
  ],
  providers: [BuyNoteService, ProvidersService],
  controllers: [BuyNoteController, ProvidersController],
  exports: [BuyNoteService, ProvidersService, TypeOrmModule],
})
export class BuyModule { }
