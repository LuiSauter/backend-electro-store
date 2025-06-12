import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ORDER_ENUM } from 'src/common/constants';
import { QueryDto } from 'src/common/dto/query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards';
import { ProvidersService } from '../services/provider.service';
import { CreateProviderDto } from '../dto/provider.dto';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';

@ApiTags('Providers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) { }

  @Post()
  public async create(
    @Body() createProviderDto: CreateProviderDto,
  ): Promise<ResponseMessage> {
    return {
      statusCode: 201,
      data: await this.providersService.create(createProviderDto),
    };
  }

  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @ApiQuery({ name: 'branch', type: 'string', required: false })
  @Get('all')
  public async findAll(
    @Query() queryDto: QueryDto,
  ): Promise<ResponseMessage> {
    const { countData, data } = await this.providersService.finAll(queryDto);
    return {
      statusCode: 200,
      data,
      countData,
    };
  }

  // @Get(':providerId')
  // public async findOne(
  //   @Param('providerId') providerId: string,
  // ): Promise<ResponseMessage> {
  //   return {
  //     statusCode: 200,
  //     data: await this.providersService.findOne(providerId),
  //   };
  // }
  // @ApiQuery({ name: 'limit', type: 'number', required: false })
  // @ApiQuery({ name: 'offset', type: 'number', required: false })
  // @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  // @ApiQuery({ name: 'attr', type: 'string', required: false })
  // @ApiQuery({ name: 'value', type: 'string', required: false })
  // @ApiQuery({ name: 'branch', type: 'string', required: false })
  // @ApiParam({ name: 'providerId', type: 'string', required: true })
  // @Get('all/:providerId')
  // public async productNotProvider(
  //   @Query() queryDto: QueryDto,
  //   @Query('branch') branch: string,
  //   @Param('providerId') providerId: string,
  //   @GetUser('userId') userId: string,
  // ): Promise<ResponseMessage> {
  //   const { countData, data } = await this.providersService.productsNotProvided(
  //     queryDto,
  //     branch,
  //     providerId,
  //     userId,
  //   );
  //   return {
  //     statusCode: 200,
  //     data,
  //     countData,
  //   };
  // }

  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileInterceptor('image'))
  // @Patch(':providerId')
  // public async update(
  //   @Param('providerId') providerId: string,
  //   @UploadedFile() image: Express.Multer.File,
  //   @Body() updateProviderDto: UpdateProviderDto,
  // ): Promise<ResponseMessage> {
  //   return {
  //     statusCode: 200,
  //     data: await this.providersService.update(providerId, updateProviderDto, image),
  //   };
  // }

  // @PermissionAccess(PERMISSION.PROVIDER)
  // @Delete('one/:providerId')
  // public async delete(
  //   @Param('providerId') providerId: string,
  // ): Promise<ResponseMessage> {
  //   return await this.providersService.delete(providerId);
  // }
}