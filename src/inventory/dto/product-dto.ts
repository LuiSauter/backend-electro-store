import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Product description', example: 'Laptop detail...' })
  @IsOptional()
  description: string;

  @ApiProperty({ description: 'Minimum stock required', example: 10 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  minimum_stock: number;

  @ApiProperty({ description: 'Current stock', example: 50 })
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({ description: 'Purchase price of the product', example: 500.0 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  purchase_price: number;

  @ApiProperty({ description: 'Sale price of the product', example: 700.0 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  sale_price: number;

  @ApiProperty({ description: 'Category ID of the product', example: 1 })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Imagen',
  })
  image?: Express.Multer.File;
}


export class UpdateProductDto extends PartialType(CreateProductDto) { }
