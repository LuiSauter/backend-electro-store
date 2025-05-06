import { Body, Controller, Get, Post, Delete, Param, UseGuards, ParseUUIDPipe, Query, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AdminAccess } from 'src/auth/decorators';
import { AuthGuard, RolesGuard } from 'src/auth/guards';
import { QueryDto } from 'src/common/dto/query.dto';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category-dto';
import { CategoryEntity } from '../entities/category.entity';
import { CategoryService } from '../services/category.service';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  public async create(@Body() body: CreateCategoryDto): Promise<CategoryEntity> {
    return await this.categoryService.create(body);
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', type: 'string', required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @Get()
  public async findAll(@Query() queryDto: QueryDto): Promise<ResponseMessage> {
    return await this.categoryService.findAll(queryDto);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  public async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.categoryService.findOne(id),
    };
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id')
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.categoryService.update(id, updateCategoryDto),
    };
  }

  @AdminAccess()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseMessage> {
    return await this.categoryService.delete(id);
  }
}
