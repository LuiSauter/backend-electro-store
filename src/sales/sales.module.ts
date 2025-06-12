import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleDetailEntity, SaleEntity } from './entities/sales.entity';
import { InventoryModule } from 'src/inventory/inventory.module';
import { UsersModule } from 'src/users/users.module';
import { SaleNoteService } from './services/sales.service';
import { SaleNoteController } from './controllers/sale.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleEntity, SaleDetailEntity
    ]),
    UsersModule,
    InventoryModule
  ],
  providers: [
    SaleNoteService
  ],
  controllers: [
    SaleNoteController
  ],
  exports: [SaleNoteService, TypeOrmModule],
})
export class SaleModule { }
