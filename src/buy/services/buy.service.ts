import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserService } from "src/users/services/users.service";
import { ProductService } from "src/inventory/services/product.service";
import { QueryDto } from "src/common/dto/query.dto";
import { ProductEntity } from "src/inventory/entities/product.entity";
import { BuyDetailEntity, BuyEntity } from "../entities/buy.entity";
import { ProvidersService } from "./provider.service";
import { CreateBuyDto } from "../dto/buy.dto";
import { getDate, handlerError } from "src/common/utils";
import { ResponseGet } from "src/common/interfaces/responseMessage.interface";

@Injectable()
export class BuyNoteService {
  private readonly logger = new Logger('BuyNoteService');

  constructor(
    @InjectRepository(BuyEntity) private readonly buyNoteRepository: Repository<BuyEntity>,
    @InjectRepository(BuyDetailEntity) private readonly buyDetailRepository: Repository<BuyDetailEntity>,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly providerService: ProvidersService,
    private readonly dataSource: DataSource,
  ) { }

  public async create(createBuyNoteDto: CreateBuyDto, userId: string): Promise<BuyEntity> {
    try {
      const { details, providerId, ...rest } = createBuyNoteDto;
      const { date, time } = getDate();
      this.logger.log({
        ...createBuyNoteDto,
        userId,
        rest
      })
      const user = await this.userService.findOne(userId);
      const provider = await this.providerService.findOne(providerId);
      this.logger.log({
        user, provider
      })
      // if (!user || !provider) throw new BadRequestException('Usuario, proveedor no encontrado');
      // transaction
      // save note
      this.logger.log({
        rest,
        date,
        time,
        user: { id: user.id },
        provider: { id: provider.id },
      })
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const buyNote = this.buyNoteRepository.create({
          ...rest,
          date,
          time,
          user: { id: user.id },
          provider: { id: provider.id },
        });
        const buyNoteSaved = await queryRunner.manager.save(buyNote);

        // save detail
        const promises = details.map(async (detail) => {
          const { price, amount } = detail;
          const quantity = parseInt(amount.toString());
          const priceFloat = parseFloat(price.toString());
          let product: ProductEntity;
          if (!product) {
            product = await this.productService.findOne(detail.productId);
            product.stock += quantity;
            await queryRunner.manager.save(product);
          }

          const saveDetail = this.buyDetailRepository.create({
            buy: { id: buyNoteSaved.id },
            product: { id: detail.productId },
            subTotal: quantity * priceFloat,
            price: priceFloat,
            amount: quantity,
          });
          await queryRunner.manager.save(saveDetail);
        });
        await Promise.all(promises);
        await queryRunner.commitTransaction();
        return buyNoteSaved;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(error.message);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findAll(queryDto: QueryDto): Promise<ResponseGet> {
    try {
      const { attr, value, limit, offset, order } = queryDto;
      const query = this.buyNoteRepository.createQueryBuilder('buy');
      query.leftJoinAndSelect('buy.provider', 'provider');
      query.leftJoinAndSelect('buy.user', 'user');
      query.leftJoinAndSelect('buy.buyDetails', 'buyDetails');
      query.orderBy('buy.createdAt', 'DESC');

      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order) query.orderBy('buy.createdAt', order.toLocaleUpperCase() as any);
      if (attr && value) {
        if (attr === 'provider') query.andWhere(`provider.name ILIKE :value`, { value: `%${value}%` });
        if (attr === 'user') query.andWhere(`user.name ILIKE :value`, { value: `%${value}%` });
        if (attr === 'date') query.andWhere(`buy.user.${attr} = :value`, { value });
        if (attr != 'date' && attr != 'provider' && attr != 'user') query.andWhere(`buy.${attr} ILIKE :value`, { value: `%${value}%` });
      }
      return {
        data: (await query.getMany()),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findAllByProduct(queryDto: QueryDto, productId: string): Promise<ResponseGet> {
    try {
      const queryDetail = this.buyDetailRepository.createQueryBuilder('buyDetails');
      queryDetail.leftJoinAndSelect('buyDetails.buy', 'buy');
      queryDetail.where('product.id = :productId', { productId });
      const details = await queryDetail.getMany();
      const notesIds = details.map((detail) => detail.buy.id);

      const { attr, value, limit, offset, order } = queryDto;
      const query = this.buyNoteRepository.createQueryBuilder('buy');
      query.leftJoinAndSelect('buy.provider', 'provider');
      query.leftJoinAndSelect('buy.user', 'user');
      query.leftJoinAndSelect('buy.branch', 'branch');
      query.leftJoinAndSelect('buy.buyDetails', 'buyDetails');
      query.where('buy.id IN (:...notesIds)', { notesIds });
      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order) query.orderBy('buy.date', order.toLocaleUpperCase() as any);
      if (attr && value) {
        if (attr === 'provider') query.andWhere(`provider.name ILIKE :value`, { value: `%${value}%` });
        if (attr === 'user') query.andWhere(`user.name ILIKE :value`, { value: `%${value}%` });
        // if (attr === 'branch') query.andWhere(`branch.name ILIKE :value`, { value: `%${value}%` });
        if (attr === 'date') query.andWhere(`buy.${attr} = :value`, { value });
        if (attr != 'date' && attr != 'provider' && attr != 'user') query.andWhere(`buy.${attr} ILIKE :value`, { value: `%${value}%` });
      }
      return {
        data: await query.getMany(),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findOne(id: string): Promise<BuyEntity> {
    try {
      return await this.buyNoteRepository.findOne({
        where: { id },
        relations: ['provider', 'user', 'buyDetails', 'provider'],
      });
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  // public async getBuyPerDate(data: GetDateByBranch): Promise<BuyNoteEntity[]> {
  //   if (!data.branchId) throw new BadRequestException('User does not have a branch assigned');
  //   let firstDay: Date;
  //   let lastDay: Date;
  //   if (!data.day) {
  //     firstDay = new Date(data.year, data.month - 1, 1);
  //     lastDay = new Date(data.year, data.month, 0);
  //   } else {
  //     firstDay = new Date(data.year, data.month - 1, data.day);
  //     lastDay = new Date(data.year, data.month - 1, data.day + 1);
  //   }
  //   const query = this.buyNoteRepository.createQueryBuilder('note');
  //   query.leftJoinAndSelect('note.buyDetails', 'buyDetails');
  //   query.leftJoinAndSelect('buyDetails.batch', 'batch');
  //   query.leftJoinAndSelect('batch.product', 'product');
  //   query.where('note.branch = :branchId', { branchId: data.branchId });
  //   query.andWhere('note.created_at BETWEEN :firstDay and :lastDay', { firstDay: firstDay, lastDay: lastDay });
  //   return await query.getMany();
  // }

  // public async getBuysPerMonth(data: GetDateByBranch): Promise<ResponseGetDate> {
  //   try {
  //     const notes = await this.getBuyPerDate(data);
  //     let total: number = 0;
  //     notes.map(async (note) => {
  //       total += note.totalAmount;
  //     });
  //     return {
  //       data: notes,
  //       total: total,
  //       countData: notes.length,
  //       month: months[data.month - 1],
  //     };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getBuyReport(queryBuyDto: QueryBuyDto): Promise<BuyNoteEntity[]> {
  //   try {
  //     const { start_date, end_date, branchId, productId, userId, providerId } = queryBuyDto;
  //     const query = this.buyNoteRepository.createQueryBuilder('note');
  //     query.leftJoinAndSelect('note.user', 'user');
  //     query.leftJoinAndSelect('note.branch', 'branch');
  //     query.leftJoinAndSelect('note.buyDetails', 'buyDetails');
  //     query.leftJoinAndSelect('note.provider', 'provider');
  //     query.leftJoinAndSelect('buyDetails.batch', 'batch');
  //     // query.leftJoinAndSelect('buyDetails.tank', 'tank');
  //     query.leftJoinAndSelect('batch.product', 'product');
  //     if (branchId) query.andWhere('note.branch = :branchId', { branchId });
  //     if (productId) query.andWhere('product.id = :productId', { productId });
  //     if (userId) query.andWhere('user.id = :userId', { userId });
  //     if (providerId) query.andWhere('provider.id = :providerId', { providerId });
  //     if (start_date && end_date) query.andWhere('note.date BETWEEN :start_date AND :end_date', { start_date, end_date });
  //     return await query.getMany();
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async buysPerYear(year: number, branchId: string): Promise<ResponseGet> {
  //   try {
  //     let data: ResponseGetDate[] = [];
  //     let countData = 0;
  //     for (let index = 1; index <= 12; index++) {
  //       const buys = await this.getBuysPerMonth({ year, month: index, branchId });
  //       data.push({ countData: buys.countData, total: buys.total, month: buys.month });
  //       countData += buys.countData;
  //     }
  //     return { data, countData };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }
}