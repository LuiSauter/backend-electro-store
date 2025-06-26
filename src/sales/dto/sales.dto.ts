import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateSaleDetailDto {
  @ApiProperty({ example: 1, type: Number, description: 'Cantidad de productos', required: true })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 100, type: Number, description: 'Precio del producto', required: true })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 100, type: Number, description: 'Subtotal', required: true })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  subTotal: number;

  @ApiProperty({ example: 'uuid-product', type: String, description: 'ID del producto', required: true })
  @IsNotEmpty()
  @IsUUID()
  productId: string;
}

export class CreateSaleDto {
  @ApiProperty({ example: 80, type: Number, description: 'Monto pagado', required: true })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ example: 100, type: Number, description: 'Monto a cobrar', required: true })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amountReceivable: number;

  @ApiProperty({ example: 20, type: Number, description: 'Monto de cambio', required: true })
  @IsNotEmpty()
  @IsNumber()
  amountReturned: number;

  @ApiProperty({ example: '2024-06-01', type: String, description: 'Fecha de la venta', required: true })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: '14:30', type: String, description: 'Hora de la venta', required: true })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({
    example: 'paymentMethod',
    type: String,
    description: 'Método de pago utilizado',
    required: false
  })
  paymentMethod: string

  @ApiProperty({ example: 0, type: Number, required: false, description: 'Descuento' })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiProperty({ example: 'uuid-seller', type: String, description: 'ID del vendedor', required: true })
  @IsNotEmpty()
  @IsUUID()
  sellerId: string;

  @ApiProperty({ example: 'uuid-customer', type: String, description: 'ID del cliente', required: true })
  @IsOptional()
  customerId: string;

  @ApiProperty({
    example: 'Cliente 1',
    description: 'Nombre del cliente',
    type: String,
    required: true,
  })
  @IsOptional()
  customerName: string

  @ApiProperty({
    example: '12345678',
    description: 'Nit del cliente',
    type: String,
    required: true,
  })
  @IsOptional()
  nit: string

  @ApiProperty({
    required: true,
    type: [CreateSaleDetailDto],
    description: 'Detalle de la venta',
    example: [{ amount: 1, price: 100, subTotal: 100, productId: 'uuid-product' }]
  })
  @IsNotEmpty()
  details: CreateSaleDetailDto[];
}
