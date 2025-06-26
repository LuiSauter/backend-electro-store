import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { CategoryEntity } from './entities/category.entity';
import { DiscountEntity } from './entities/discount.entity';
import { DiscountService } from './services/discount.service';
import { CategoryService } from './services/category.service';
import { DiscountController } from './controllers/discount.controller';
import { CategoryController } from './controllers/category.controller';
import { UsersModule } from 'src/users/users.module';
import { OutputEntity } from './entities/output.entity';
import { ProductOutputEntity } from './entities/product-output.entity';
import { OutputService } from './services/output.service';
import { OutputController } from './controllers/output.controller';
import { NotificationEntity } from './entities/notification.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity, CategoryEntity, DiscountEntity, OutputEntity, ProductOutputEntity, NotificationEntity
    ]),
    UsersModule
  ],
  providers: [ProductService, DiscountService, CategoryService, OutputService],
  controllers: [ProductController, DiscountController, CategoryController, OutputController ],
  exports: [ProductService, TypeOrmModule, DiscountService, CategoryService, OutputService],
})
export class InventoryModule { }
