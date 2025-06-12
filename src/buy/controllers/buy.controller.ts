import { Body, Controller, Get, Param, Post, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ORDER_ENUM } from 'src/common/constants';
import { QueryDto } from 'src/common/dto/query.dto';
import { BuyNoteService } from '../services/buy.service';
import { CreateBuyDto } from '../dto/buy.dto';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { GetUser } from 'src/users/decorators/get-user.decorator';
import { AuthGuard } from 'src/auth/guards';

@ApiTags('Buy')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('buy')
export class BuyNoteController {
  constructor(private readonly buyNoteService: BuyNoteService) {}

  @Post()
  async create(@Body() createBuyNoteDto: CreateBuyDto, @GetUser() userId: string): Promise<ResponseMessage> {
    return {
      statusCode: 201,
      data: await this.buyNoteService.create(createBuyNoteDto, userId),
    };
  }

  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false, description: 'Solo atributos tipo texto' })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @Get()
  async findAll(@Query() queryDto: QueryDto): Promise<ResponseMessage> {
    const { data, countData } = await this.buyNoteService.findAll(queryDto);
    return {
      statusCode: 200,
      countData,
      data,
    };
  }

  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false, description: 'Solo atributos tipo texto' })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @ApiParam({ name: 'productId', type: 'string' })
  @Get('product/:productId')
  async findAllByProduct(@Query() queryDto: QueryDto, @Param('productId', ParseUUIDPipe) productId: string): Promise<ResponseMessage> {
    const { data, countData } = await this.buyNoteService.findAllByProduct(queryDto, productId);
    return {
      statusCode: 200,
      countData,
      data,
    };
  }

  @ApiParam({ name: 'noteId', type: 'string' })
  @Get(':noteId')
  async findOne(@Param('noteId', ParseUUIDPipe) noteId: string): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.buyNoteService.findOne(noteId),
    };
  }

  // @ApiParam({ name: 'year', type: 'number' })
  // @Get('year/:year')
  // async findByYear(@Param('year') year: number, @GetBranch('branchId') branchId: string): Promise<ResponseMessage> {
  //   const { data, countData } = await this.buyNoteService.buysPerYear(year, branchId);
  //   return {
  //     statusCode: 200,
  //     data,
  //     countData,
  //   };
  // }

  // No requiere permisos
  // @ApiParam({ name: 'year', type: 'number' })
  // @ApiParam({ name: 'month', type: 'number' })
  // @Get('month/:year/:month')
  // async findByMonth(@Param('year') year: number, @Param('month') month: number, @GetBranch('branchId') branchId: string): Promise<ResponseMessage> {
  //   const { data, countData } = await this.buyNoteService.getBuysPerMonth({ year, month, branchId });
  //   return {
  //     statusCode: 200,
  //     data,
  //     countData,
  //   };
  // }

  // No requiere permisos
  // @ApiParam({ name: 'year', type: 'number' })
  // @ApiParam({ name: 'month', type: 'number' })
  // @Get('date/:year/:month')
  // async findByDate(@Param('year') year: number, @Param('month') month: number, @GetBranch('branchId') branchId: string): Promise<ResponseMessage> {
  //   return {
  //     statusCode: 200,
  //     data: await this.buyNoteService.getBuyPerDate({ year, month, branchId }),
  //   };
  // }
}