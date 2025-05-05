import { Injectable, Logger } from '@nestjs/common';

import { handlerError } from '../common/utils';
import { ROLES } from 'src/common/constants';
import { UserService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeederService');
  private readonly configService: ConfigService

  constructor(
    private readonly userService: UserService,
  ) { }

  public async runSeeders() {
    if (this.configService.get('APP_PROD') === true)
      return { message: 'No se puede ejecutar seeders en producción' };
    try {
      const user: CreateUserDto = {
        name: 'luis',
        last_name: 'janco',
        email: 'luis@gmail.com',
        password: '12345678',
        role: ROLES.ADMIN,
        country_code: '+591',
        phone: '78010833',
        photo_url: 'https://example.com/photo.jpg'
      };
      await this.userService.createUser(user);

      const user2: CreateUserDto = {
        name: 'Jaime',
        last_name: 'Roca',
        email: 'jr@gmail.com',
        password: '12345678',
        country_code: '+591',
        phone: '71026123',
        photo_url: 'https://example.com/photo.jpg',
        role: ROLES.CLIENT,
      };
      await this.userService.createUser(user2);

      return { message: 'Seeders ejecutados correctamente' };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }
}
