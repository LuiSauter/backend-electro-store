import { Controller, Get, Post, Body, Param, UseGuards, Query} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards';
import { ORDER_ENUM } from 'src/common/constants';
import { QueryDto } from 'src/common/dto/query.dto';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { CreateOutputDto } from '../dto/output-dto';
import { OutputService } from '../services/output.service';

@ApiTags('Output')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('output')
export class OutputController {
  constructor(private readonly outputService: OutputService) { }

  @Post()
  public async create(
    @Body() createOutputDto: CreateOutputDto,
  ): Promise<ResponseMessage> {
    return {
      statusCode: 200,
      data: await this.outputService.create(createOutputDto),
    };
  }

  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiQuery({ name: 'order', enum: ORDER_ENUM, required: false })
  @ApiQuery({ name: 'attr', type: 'string', required: false })
  @ApiQuery({ name: 'value', type: 'string', required: false })
  @Get()
  async findAll(
    @Query() queryDto: QueryDto,
  ): Promise<ResponseMessage> {
    const {countData, data} = await this.outputService.findAll(queryDto)
    return {
      statusCode: 200,
      data,
      countData
    };
  }

  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<ResponseMessage> {
    return { statusCode: 200, data: await this.outputService.findOne(id) };
  }

  // @Patch(':id')
  // public async update(
  //   @Param('id') id: string,
  //   @Body() updateOutputDto: UpdateOutputDto,
  // ): Promise<ResponseMessage> {
  //   return {
  //     statusCode: 200,
  //     data: await this.outputService.update(id, updateOutputDto),
  //   };
  // }

  // @Delete(':id')
  // public async delete(@Param('id') id: string): Promise<ResponseMessage> {
  //   return await this.outputService.delete(id);
  // }
}