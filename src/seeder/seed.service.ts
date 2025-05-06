import { Injectable, Logger } from '@nestjs/common';

import { handlerError } from '../common/utils';
import { ROLES } from 'src/common/constants';
import { UserService } from 'src/users/services/users.service';
import { CreateUserDto } from 'src/users/dto';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import axios from 'axios';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeederService');

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource
  ) { }

  public async runSeeders() {
    try {
      await this.createUsersAndAssignRoles();

      return { message: 'Seeders ejecutados correctamente' };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  private async createUsersAndAssignRoles() {
    try {
      if ((await this.userService.findAll({})).countData > 0) {
        this.logger.log('Ya existen usuarios en la base de datos');
        return;
      }
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
      const userAdmin = await this.userService.createUser(user);

      const user2: CreateUserDto = {
        name: 'Jaime',
        last_name: 'Roca',
        email: 'jr@gmail.com',
        password: '12345678',
        country_code: '+591',
        phone: '71026123',
        photo_url: 'https://example.com/photo.jpg',
        role: ROLES.CASHIER,
      };
      const userClient = await this.userService.createUser(user2);

      const response = await axios.get('https://jsonplaceholder.typicode.com/users');
      const apiUsers = response.data

      for (const apiUser of apiUsers) {
        const newUser: CreateUserDto = {
          name: apiUser.name,
          last_name: apiUser.username,
          email: apiUser.email,
          password: '12345678', // Default password for API users
          role: ROLES.CLIENT,
          country_code: '+1', // Default country code
          phone: apiUser.phone, // Extract phone number
          photo_url: 'https://example.com/default-photo.jpg', // Default photo URL
        };
        await this.userService.createUser(newUser);
      }

      return { userAdmin, userClient };

    } catch (error) {
      handlerError(error, this.logger);
      throw new Error('Error al crear usuarios');
    }
  }

  async resetDatabase() {
    await this.dataSource.dropDatabase();
    await this.dataSource.synchronize();

    return {
      message: 'Base de datos reiniciada exitosamente',
    }
  }
}
