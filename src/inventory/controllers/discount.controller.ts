import { Body, Controller, Get, Post, Delete, Param, UseGuards, ParseUUIDPipe, Query, Patch, } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags, } from '@nestjs/swagger';

import { AdminAccess } from 'src/auth/decorators';
import { AuthGuard, RolesGuard } from 'src/auth/guards';
import { QueryDto } from 'src/common/dto/query.dto';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { CreateDiscountDto, UpdateDiscountDto } from '../dto/discount-dto';
import { DiscountEntity } from '../entities/discount.entity';
import { DiscountService } from '../services/discount.service';

@ApiTags('Discounts')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('discount')
export class DiscountController {

  constructor(private readonly discountService: DiscountService) { }

  @Post()
  public async create(@Body() body: CreateDiscountDto): Promise<DiscountEntity> {
    return await this.discountService.create(body);
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', type: 'string', required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @Get()
  public async findAll(@Query() queryDto: QueryDto): Promise<ResponseMessage> {
    return await this.discountService.findAll(queryDto);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  public async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseMessage> {
    console.log(id)
    return {
      statusCode: 200,
      data: await this.discountService.findOne(id),
    };
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id')
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.discountService.update(id, updateDiscountDto),
    };
  }

  @AdminAccess()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string,): Promise<ResponseMessage> {
    return await this.discountService.delete(id);
  }
}
