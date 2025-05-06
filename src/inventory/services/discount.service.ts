import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { QueryDto } from 'src/common/dto/query.dto';
import { handlerError } from 'src/common/utils';
import { ResponseMessage } from 'src/common/interfaces/responseMessage.interface';
import { CreateDiscountDto, UpdateDiscountDto } from '../dto/discount-dto';
import { DiscountEntity } from '../entities/discount.entity';

@Injectable()
export class DiscountService {
  private readonly logger = new Logger('DiscountService');

  constructor(
    @InjectRepository(DiscountEntity)
    private readonly discountRepository: Repository<DiscountEntity>,
  ) {}

  public async findAll(queryDto: QueryDto): Promise<ResponseMessage> {
    try {
      const { limit, offset, order, attr, value } = queryDto;
      const query = this.discountRepository.createQueryBuilder('discount');
      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order)
        query.orderBy('discount.createdAt', order.toLocaleUpperCase() as any);
      if (attr && value)
        query.where(`discount.${attr} ILIKE :value`, { value: `%${value}%` });
      return {
        statusCode: 200,
        data: await query.getMany(),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async create(createDiscountDto: CreateDiscountDto): Promise<DiscountEntity> {
    try {
      const discount = this.discountRepository.create(createDiscountDto);
      return await this.discountRepository.save(discount);
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findOne(id: string): Promise<DiscountEntity> {
    try {
      const discount = await this.discountRepository.findOne({ where: { id } });
      if (!discount) {
        throw new NotFoundException(`Discount with ID ${id} not found`);
      }
      return discount;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async update(id: string, updateDiscountDto: UpdateDiscountDto): Promise<DiscountEntity> {
    try {
      const discount = await this.findOne(id);
      Object.assign(discount, updateDiscountDto);
      return await this.discountRepository.save(discount);
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async delete(id: string): Promise<ResponseMessage> {
    try {
      const discount = await this.findOne(id);
      await this.discountRepository.remove(discount);
      return {
        statusCode: 200,
        message: `Discount with ID ${id} has been deleted`,
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }
}
