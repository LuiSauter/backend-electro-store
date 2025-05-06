import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty({ description: 'Discount name', example: 'Holiday Sale' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Discount amount', example: 50.0 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Discount percentage', example: 10 })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  percent: number;

  @ApiProperty({ description: 'Start date of the discount', example: '2023-01-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  initialDate: string;

  @ApiProperty({ description: 'End date of the discount', example: '2023-01-31T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  finalDate: string;

  @ApiProperty({ description: 'Product ID associated with the discount', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  productId: string;
}

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
