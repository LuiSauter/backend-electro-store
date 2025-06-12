import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDto } from 'src/common/dto/query.dto';
import { ProviderEntity } from '../entities/providers.entity';
import { CreateProviderDto } from '../dto/provider.dto';
import { handlerError } from 'src/common/utils';
import { ResponseGet } from 'src/common/interfaces/responseMessage.interface';

@Injectable()
export class ProvidersService {
  private readonly logger = new Logger('ProvidersService');

  constructor(
    @InjectRepository(ProviderEntity)
    private readonly providerRepository: Repository<ProviderEntity>,
  ) { }

  public async create(
    createProviderDto: CreateProviderDto
  ): Promise<ProviderEntity> {
    try {
      this.logger.log(createProviderDto);
      const provider = this.providerRepository.create(createProviderDto);
      return await this.providerRepository.save(provider);
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async finAll(
    queryDto: QueryDto,
  ): Promise<ResponseGet> {
    try {
      const { limit, offset, order, attr, value } = queryDto;

      const query = this.providerRepository
        .createQueryBuilder('provider')
        .andWhere('provider.is_active = :is_active', { is_active: true });

      if (limit) query.take(limit);
      if (offset) query.skip(offset); // Usa .skip() para offset
      if (order) query.orderBy('provider.name', order.toUpperCase() as any);

      if (attr && value) {
        query.andWhere(`provider.${attr} ILIKE :value`, {
          value: `%${value}%`,
        });
      }

      const data = await query.getMany();
      const countData = await query.getCount();

      return {
        data,
        countData,
      };
    } catch (error) {
      handlerError(error, this.logger);
      throw error;
    }
  }

  public async findOne(id: string): Promise<ProviderEntity> {
    try {
      const provider = this.providerRepository.findOne({ where: { id } });

      if (!provider) throw new NotFoundException('Proveedor no encontrado');

      return provider;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  // public async update(
  //   id: string,
  //   updateProviderDto: UpdateProviderDto,
  //   imageFile?: Express.Multer.File
  // ): Promise<ProviderEntity> {
  //   let pathAux = ''
  //   try {
  //     const provider: ProviderEntity = await this.findOne(id);
  //     let urlAux = ''
  //     const { image, ...rest } = updateProviderDto
  //     if (imageFile) {
  //       const localStorageResponse: CloudComputingResponse = await this.localStorageService.uploadFile({
  //         file: imageFile, path: 'products',
  //       });
  //       pathAux = localStorageResponse.path;
  //       urlAux = localStorageResponse.url;
  //       await this.localStorageService.deleteFile({ path: provider.path_image });
  //     }
  //     const providerUpdate = await this.providerRepository.update(
  //       id,
  //       { ...rest, image_url: urlAux, path_image: pathAux }
  //     );

  //     if (providerUpdate.affected === 0)
  //       throw new Error('Proveedor no fue modificado');

  //     return await this.findOne(id);
  //   } catch (error) {
  //     if (pathAux) await this.localStorageService.deleteFile({ path: pathAux });
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async delete(id: string): Promise<ResponseMessage> {
  //   try {
  //     const providerDeleted = await this.providerRepository.update(id, {
  //       isActive: false,
  //     });

  //     if (providerDeleted.affected === 0)
  //       throw new BadRequestException('Proveedor no fue eliminado');

  //     return { statusCode: 200, message: 'Proveedor eliminado' };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async productsNotProvided(
  //   queryDto: QueryDto,
  //   branch: string,
  //   providerId: string,
  //   userId: string,
  // ): Promise<ResponseGet> {
  //   try {
  //     const { limit, offset, order, attr, value } = queryDto;
  //     const subQuery = this.providerProductRepository
  //       .createQueryBuilder('provider_product')
  //       .select('provider_product.product.id')
  //       .where('provider_product.provider.id = :providerId', { providerId });

  //     const query = this.productRepository
  //       .createQueryBuilder('product')
  //       .leftJoin('product.branch', 'branch')
  //       .where(`product.id NOT IN (${subQuery.getQuery()})`)
  //       .andWhere('branch.is_suspended = :is_suspended', {
  //         is_suspended: false,
  //       })
  //       .setParameters(subQuery.getParameters());

  //     const user = await this.userService.findOne(userId);

  //     if (user.role.name === ROLE.ADMIN) {
  //       if (branch) {
  //         query.andWhere('branch.id = :branch', { branch });
  //       }
  //     } else {
  //       query.andWhere('branch.id = :branch', { branch: user.branch.id });
  //     }

  //     if (limit) query.take(limit);
  //     if (offset) query.skip(offset);
  //     if (order) query.orderBy(`product.${order}`, 'ASC');
  //     if (attr && value) {
  //       query.andWhere(`product.${attr} ILIKE :value`, { value: `%${value}%` });
  //     }

  //     const data = await query.getMany();
  //     const countData = await query.getCount();

  //     return {
  //       data,
  //       countData,
  //     };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //     throw error;
  //   }
  // }
}