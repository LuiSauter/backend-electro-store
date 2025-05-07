import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { FileService } from '../services/file.service';

@ApiTags('File')
@Controller('files')
export class FileController {

  constructor(
    private readonly fileService: FileService
  ) { }

  @Get(':pathfile/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('pathfile') pathfile: string,
    @Param('imageName') imageName: string
  ) {
    const pathFile = this.fileService.getPathImage(pathfile, imageName);
    res.sendFile(pathFile);
  }
}
