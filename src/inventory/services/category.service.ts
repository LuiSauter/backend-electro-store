import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CategoryEntity } from '../entities/category.entity';
import { QueryDto } from 'src/common/dto/query.dto';
import { handlerError } from 'src/common/utils';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category-dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger('CategoryService');

  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  public async findAll(queryDto: QueryDto): Promise<ResponseMessage> {
    try {
      const { limit, offset, order, attr, value } = queryDto;
      const query = this.categoryRepository.createQueryBuilder('category');
      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order)
        query.orderBy('category.createdAt', order.toLocaleUpperCase() as any);
      if (attr && value)
        query.where(`category.${attr} ILIKE :value`, { value: `%${value}%` });
      return {
        statusCode: 200,
        data: await query.getMany(),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    try {
      const category = this.categoryRepository.create({
        name: createCategoryDto.name,
        is_active: true
      });
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findOne(id: string): Promise<CategoryEntity> {
    try {
      const category = await this.categoryRepository.findOne({ where: { id } });
      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }
      return category;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryEntity> {
    try {
      const category = await this.findOne(id);
      Object.assign(category, updateCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async delete(id: string): Promise<ResponseMessage> {
    try {
      const category = await this.findOne(id);
      await this.categoryRepository.remove(category);
      return {
        statusCode: 200,
        message: `Category with ID ${id} deleted successfully`,
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }
}
