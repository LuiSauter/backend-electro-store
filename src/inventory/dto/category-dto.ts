import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Product name', example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  name: string;
}


export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }
