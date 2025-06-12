import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateBuyDetailDto {

  @ApiProperty({ example: 1, type: Number, description: 'Cantidad de productos' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ example: 40, type: Number, description: 'Precio del producto' })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 40, type: Number, description: 'Subtotal del producto' })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  subTotal: number;

  @ApiProperty({ example: 'IdDelProducto', type: String, description: 'Id del producto' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  productId: string;
}

export class CreateBuyDto {

  @ApiProperty({ example: 40, type: Number, description: 'Monto pagado' })
  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: 'IdDelProveedor', type: String, description: 'Id del proveedor' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  providerId: string;

  @ApiProperty({ type: [CreateBuyDetailDto], description: 'Array de los detalles de la compra' })
  @IsNotEmpty()
  details: CreateBuyDetailDto[];
}

