import { DataSource, Repository } from 'typeorm';
import { Injectable, InternalServerErrorException, Logger, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { QueryDto } from 'src/common/dto/query.dto';
import { handlerError } from 'src/common/utils';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { ProductEntity } from '../entities/product.entity';
import { CreateNotification, CreateProductDto, UpdateProductDto } from '../dto/product-dto';
import { DiscountService } from './discount.service';
import { CategoryService } from './category.service';
import axios from 'axios';
import * as FormData from 'form-data';
import { LocalStorageService } from 'src/providers/local-storage/local-storage.service';
import { NotificationEntity } from '../entities/notification.entity';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('ProductService');
  private readonly apiKey = process.env.IMGBB_API_KEY;
  private readonly uploadUrl = 'https://api.imgbb.com/1/upload';

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly discountService: DiscountService,
    private readonly categoryService: CategoryService,
    private readonly localStorageService: LocalStorageService,

    private readonly dataSources: DataSource,
  ) { }

  public async findAll(queryDto: QueryDto): Promise<ResponseMessage> {
    try {
      const { limit, offset, order, attr, value } = queryDto;
      const query = this.productRepository.createQueryBuilder('product');
      query.leftJoinAndSelect('product.category', 'category');
      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order)
        query.orderBy('product.createdAt', order.toLocaleUpperCase() as any);
      if (attr && value)
        query.where(`product.${attr} ILIKE :value`, { value: `%${value}%` });
      return {
        statusCode: 200,
        data: await query.getMany(),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async create(createProductDto: CreateProductDto, img: Express.Multer.File): Promise<ProductEntity> {
    try {
      const { categoryId, image, ...rest } = createProductDto;
      let pathAux = '';
      const queryRunner = this.dataSources.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // this.logger.log(img);
      try {
        const caregory = await this.categoryService.findOne(categoryId);

        let imageUrl: string | null = null;
        let imagePath: string | null = null;
        if (img && img.buffer && img.buffer.length > 0) {
          const localStorageResponse = await this.localStorageService.uploadFile({
            file: img,
            path: 'products',
          })
          imageUrl = localStorageResponse.url;
          imagePath = localStorageResponse.path;
          pathAux = localStorageResponse.path;
        }
        const product = this.productRepository.create({
          ...rest,
          image_url: imageUrl,
          image_path: imagePath,
          category: { id: caregory.id }
        })
        await queryRunner.manager.save(product);
        await queryRunner.commitTransaction();
        // await this.productRepository.save(product);
        return product;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (pathAux) await this.localStorageService.deleteFile({ path: pathAux });
        throw new InternalServerErrorException(error.message);
      } finally {
        await queryRunner.release()
      }
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    try {
      const base64 = file.buffer.toString('base64');
      const form = new FormData();
      form.append('image', base64);

      const url = `${this.uploadUrl}?expiration=600&key=${this.apiKey}`;
      const headers = form.getHeaders();

      this.logger.debug('Uploading image to ImgBB...');
      this.logger.debug(`Image size: ${file.size} bytes`);

      const response = await axios.post(url, form, { headers });

      const imageUrl = response.data.data.url;
      this.logger.debug(`Uploaded image URL: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error('Error uploading image to ImgBB:', error.message);
      if (axios.isAxiosError(error)) {
        this.logger.debug('ImgBB response error:', error.response?.data);
      }
      throw new InternalServerErrorException('No se pudo subir la imagen a ImgBB');
    }
  }

  public async findOne(id: string): Promise<ProductEntity> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, relations: ['category'] });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    try {
      const product = await this.findOne(id);
      Object.assign(product, updateProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async delete(id: string): Promise<ResponseMessage> {
    try {
      const product = await this.findOne(id);
      await this.productRepository.remove(product);
      return {
        statusCode: 200,
        message: `Product with ID ${id} has been deleted`,
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findOneBy({ key, value }: { key: keyof CreateProductDto; value: any; }): Promise<ProductEntity> {
    try {
      const product = await this.productRepository.findOne({ where: { [key]: value } });
      if (!product) {
        throw new NotFoundException(`Product with ${key} ${value} not found`);
      }
      return product;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async createNotification(params: CreateNotification): Promise<NotificationEntity> {
    try {
      this.logger.log(params);
      const { currentStock, minStock, productId } = params
      const notification = this.notificationRepository.create({
        currentStock,
        minStock,
        product: { id: productId },
      });
      await this.notificationRepository.save(notification);
      return notification;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  // get all notifications
  public async getAllNotifications(): Promise<NotificationEntity[]> {
    try {
      return await this.notificationRepository.find({
        relations: ['product'],
      });
    } catch (error) {
      handlerError(error, this.logger);
    }
  }
}
