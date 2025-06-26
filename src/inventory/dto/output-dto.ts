import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateProductOutputDto {
  @ApiProperty({ example: 12, description: 'Cantidad de salida de productos' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '1', description: 'Identificador del producto' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;
}

export class CreateOutputDto {
  @ApiProperty({ example: 'Vencimiento', description: 'Motivo de la salida' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ example: 'Destino 1', description: 'Destino de la salida' })
  @IsOptional()
  destination: string;

  @ApiProperty({
    example: '3 días de vencimiento',
    description: 'Nota adicional para la salida',
  })
  @IsOptional()
  additionalNotes: string;

  @ApiProperty({
    example: '1',
    description: 'Identificador del usuario con quien se relaciona',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    type: [CreateProductOutputDto],
    description: 'Array de detalles de salida de producto',
  })
  @IsNotEmpty()
  details: CreateProductOutputDto[];
}

export class UpdateOutputDto extends PartialType(CreateOutputDto) {}