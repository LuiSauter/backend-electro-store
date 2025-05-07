import { Injectable, Logger } from '@nestjs/common';

import { handlerError } from '../../common/utils';
import { LocalStorageService } from 'src/providers/local-storage/local-storage.service';

@Injectable()
export class FileService {
  private readonly logger = new Logger('fileService');

  constructor(
    private readonly localStorageService: LocalStorageService
  ) { }

  getPathImage(pathFile: string, imageName: string) {
    try {
      return this.localStorageService.verifyFileExist({ path: pathFile, name: imageName });
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

}
