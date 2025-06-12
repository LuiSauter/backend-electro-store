import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ROLES } from 'src/common/constants';

export class CreateUserDto {
  @ApiProperty({ description: 'User\'s first name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User\'s last name', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({ description: 'User\'s email address', example: 'john.doe@example.com' })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User\'s password', example: 'securePassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;


  @ApiProperty({ description: 'Role assigned to the user', enum: ROLES, example: ROLES.CLIENT })
  @IsEnum(ROLES)
  @IsNotEmpty()
  @IsString()
  role: ROLES;

  @ApiProperty({ description: 'User\'s phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty({ description: 'nit o ci', example: '999919219' })
  @IsOptional()
  nit?: string;

  @ApiProperty({ description: 'URL of the user\'s photo', example: 'https://example.com/photo.jpg' })
  @IsString()
  @IsOptional()
  photo_url: string;

  @ApiProperty({ description: 'Country code of the user', example: 'US' })
  @IsString()
  @IsOptional()
  country_code: string;
}
