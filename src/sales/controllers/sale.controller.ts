import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from "@nestjs/swagger";
import { GetUser } from "src/users/decorators/get-user.decorator";
import { ORDER_ENUM } from "src/common/constants";
import { QueryDto } from "src/common/dto/query.dto";
import { AuthGuard } from "src/auth/guards";
import { SaleNoteService } from "../services/sales.service";
import { CreateSaleDto } from "../dto/sales.dto";
import { ResponseMessage } from "src/common/interfaces/responseMessage.interface";

@ApiTags('Sale Note')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('sale-note')
export class SaleNoteController {

  constructor(private readonly saleNoteService: SaleNoteService) { }
  @Post()
  async create(
    @Body() createSaleNoteDto: CreateSaleDto,
    @GetUser('userId') userId: string,
  ): Promise<ResponseMessage> {
    return {
      statusCode: 201,
      data: await this.saleNoteService.create(createSaleNoteDto, userId)
    }
  }

  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false, description: 'Solo atributos tipo texto' })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @ApiQuery({ name: 'branchId', type: 'string', required: false })
  @Get()
  async findAll(
    @Query() queryDto: QueryDto
  ): Promise<ResponseMessage> {
    const { data, countData } = await this.saleNoteService.findAll(queryDto);
    return {
      statusCode: 200, countData, data
    }
  }

  @ApiParam({ name: 'noteId', type: 'string' })
  @Get(':noteId')
  async findOne(@Param('noteId', ParseUUIDPipe) noteId: string): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.saleNoteService.findOne(noteId)
    }
  }

  // @ApiParam({ name: 'noteId', type: 'string' })
  // @Delete(':noteId')
  // remove(@Param('noteId', ParseUUIDPipe) noteId: string): Promise<ResponseMessage> {
  //   return this.saleNoteService.remove(noteId);
  // }

  // // No requiere permisos
  // @ApiParam({ name: 'year', type: 'number' })
  // @Get("year/:year")
  // async findByYear(
  //   @Param('year') year: number,
  //   @GetBranch('branchId') branchId: string
  // ): Promise<ResponseMessage> {
  //   const { data, countData } = await this.saleNoteService.salesPerYear(year, branchId);
  //   return {
  //     statusCode: 200, data, countData
  //   }
  // }

  // // No requiere permisos
  // @ApiParam({ name: 'year', type: 'number' })
  // @ApiParam({ name: 'month', type: 'number' })
  // @Get("date/:year/:month")
  // async findByMonth(
  //   @Param('year') year: number,
  //   @Param('month') month: number,
  //   @GetBranch('branchId') branchId: string
  // ): Promise<ResponseMessage> {
  //   const { data, countData } = await this.saleNoteService.salesPerMount(year, month, branchId);
  //   return {
  //     statusCode: 200, data, countData
  //   }
  // }

  // // No requiere permisos
  // @ApiParam({ name: 'year', type: 'number' })
  // @ApiParam({ name: 'month', type: 'number' })
  // @Get("product/:year/:month")
  // async findProductsSoldByMonth(
  //   @Param('year') year: number,
  //   @Param('month') month: number,
  //   @GetBranch('branchId') branchId: string,
  // ): Promise<ResponseMessage> {
  //   const { data, countData } = await this.saleNoteService.productsoldPerMonth(year, month, branchId);
  //   return {
  //     statusCode: 200, data, countData
  //   }
  // }

  // @PermissionAccess(PERMISSION.SALE_NOTE)
  // @ApiParam({ name: 'noteId', type: 'string' })
  // @Get('customer/:nit')
  // async findOneCustomer(@Param('noteId') noteId: string): Promise<ResponseMessage> {
  //   return {
  //     statusCode: 200,
  //     data: await this.saleNoteService.getOneCustomer(noteId)
  //   }
  // }
}