import { Body, Controller, Get, Post, Delete, Param, UseGuards, ParseUUIDPipe, Query, Patch, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery, ApiTags, } from '@nestjs/swagger';

import { AdminAccess } from 'src/auth/decorators';
import { AuthGuard, RolesGuard } from 'src/auth/guards';
import { QueryDto } from 'src/common/dto/query.dto';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { CreateProductDto, UpdateProductDto } from '../dto/product-dto';
import { ProductEntity } from '../entities/product.entity';
import { ProductService } from '../services/product.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('product')
export class ProductController {

  constructor(private readonly productService: ProductService) { }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @Post()
  public async createUser(
    @Body() body: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ProductEntity> {
    return await this.productService.create(body, image);
  }

  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', type: 'string', required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @Get()
  public async findAll(@Query() queryDto: QueryDto): Promise<ResponseMessage> {
    return await this.productService.findAll(queryDto);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  public async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseMessage> {
    console.log(id)
    return {
      statusCode: 200,
      data: await this.productService.findOne(id),
    };
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id')
  public async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateProductDto,
  ): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.productService.update(id, updateUserDto),
    };
  }

  @AdminAccess()
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBearerAuth()
  @Delete(':id')
  public async delete(@Param('id', ParseUUIDPipe) id: string,): Promise<ResponseMessage> {
    return await this.productService.delete(id);
  }
}
