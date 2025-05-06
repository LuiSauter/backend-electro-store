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


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity, CategoryEntity, DiscountEntity
    ]),
    UsersModule
  ],
  providers: [ProductService, DiscountService, CategoryService],
  controllers: [ProductController, DiscountController, CategoryController],
  exports: [ProductService, TypeOrmModule],
})
export class InventoryModule { }
