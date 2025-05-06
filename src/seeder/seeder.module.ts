import { Module } from '@nestjs/common';

import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';
import { UsersModule } from 'src/users/users.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [UsersModule, InventoryModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeederModule { }
