import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { IProvider } from '../entities/providers.entity';

export class CreateProviderDto implements Partial<IProvider> {
  @ApiProperty({
    example: 'Jhon Dea',
    description: 'Nombre del proveedor',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: '12345678',
    description: 'Número de celular del proveedor',
    maxLength: 15,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(15)
  phone?: string;

  @ApiProperty({
    example: 'jdexample@gmail.com',
    description: 'Email del proveedor',
    maxLength: 100,
    uniqueItems: true,
    required: false,
  })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiProperty({
    example: 'Calle 1',
    description: 'Dirección del proveedor',
    maxLength: 100,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  address?: string;

  @ApiProperty({
    example: '1234',
    description: 'NIT (tax identification number) del proveedor',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nit: string;

  @ApiProperty({
    example: 'Proveedor de alimentos',
    description: 'Detalle sobre el proveedor',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  detail?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el proveedor está activo',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {}