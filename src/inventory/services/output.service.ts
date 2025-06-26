import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OutputEntity } from '../entities/output.entity';
import { ProductOutputEntity } from '../entities/product-output.entity';
import { ProductService } from 'src/inventory/services/product.service';
import { UserService } from 'src/users/services/users.service';
import { CreateOutputDto } from '../dto/output-dto';
import { getDate, handlerError } from 'src/common/utils';
import { QueryDto } from 'src/common/dto/query.dto';
import { ResponseGet } from 'src/common/interfaces/responseMessage.interface';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';

@Injectable()
export class OutputService {
  private readonly logger = new Logger('OutputService');

  constructor(
    @InjectRepository(OutputEntity)
    private readonly outputRepository: Repository<OutputEntity>,
    @InjectRepository(ProductOutputEntity)
    private readonly productOutputRepository: Repository<ProductOutputEntity>,
    private readonly productService: ProductService,
    private readonly userService: UserService,
    private readonly webSocketGateway: WebsocketGateway,
    private readonly dataSource: DataSource,
  ) { }

  public async create(createOutputDto: CreateOutputDto): Promise<OutputEntity> {
    try {
      const { details, userId, ...rest } = createOutputDto;
      const { date, time } = getDate();
      const user = await this.userService.findOne(userId);

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const output = this.outputRepository.create({
          ...rest,
          date,
          time,
          user: { id: user.id },
        });
        const outputSaved = await queryRunner.manager.save(output);
        const promises = details.map(async (detail) => {
          const { amount, productId } = detail;
          const product = await this.productService.findOne(productId);

          if (product.stock < amount)
            throw new Error('Stock insuficiente en el producto');
          product.stock -= amount;
          await queryRunner.manager.save(product);

          const productOutput = this.productOutputRepository.create({
            amount,
            product: { id: product.id },
            output: { id: outputSaved.id },
          });
          await queryRunner.manager.save(productOutput);
        });
        await Promise.all(promises);
          // verificar si el stock del producto llego al minimo
        const products = details.map(detail => detail.productId);
        products.forEach(async productId => {
          const product = await this.productService.findOne(productId);
          if (product.stock <= product.minimum_stock) {
            this.productService.createNotification({
              currentStock: product.stock,
              minStock: product.minimum_stock,
              productId: product.id
            })
            this.webSocketGateway.handleMinimunStock({
              product: product,
              title: 'Stock mínimo alcanzado',
              body: `El producto ${product.name} ha llegado al stock mínimo de ${product.minimum_stock}.`,
              type: 'minimun_stock',
            });
          }
        });
        await queryRunner.commitTransaction();
        return outputSaved;
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
      const { limit, offset, order, attr, value } = queryDto;
      const query = this.outputRepository.createQueryBuilder('output');
      query.leftJoinAndSelect('output.user', 'user');
      query.leftJoinAndSelect('output.productOutput', 'productOutput');

      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order) query.orderBy('output.createdAt', order.toLocaleUpperCase() as any);
      if (attr && value) {
        if (attr === 'user') query.andWhere(`user.name ILIKE :value`, { value: `%${value}%` });
        if (attr === 'date') query.andWhere(`output.${attr} = :value`, { value });
        if (attr != 'date' && attr != 'user' && attr != 'branch')
          query.andWhere(`buyNote.${attr} ILIKE :value`, { value: `%${value}%` });
      }

      return {
        data: await query.getMany(),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findOne(id: string): Promise<OutputEntity> {
    try {
      const output = await this.outputRepository.findOne({
        where: { id },
        relations: [
          'productOutput',
          'user',
          'productOutput.product',
        ],
      });
      if (!output) throw new NotFoundException('Output not found');
      return output;
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  // public async update(
  //   id: string,
  //   updateOutputDto: UpdateOutputDto,
  // ): Promise<OutputEntity> {
  //   try {
  //     const { details, userId, branchId, ...rest } = updateOutputDto;
  //     const user = await this.userService.findOne(userId);
  //     const branch = await this.branchService.findOne(branchId);

  //     const queryRunner = this.dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //     try {
  //       let output = await this.findOne(id);
  //       if (!output) throw new NotFoundException('Salida no encontrada');

  //       Object.assign(output, { ...rest, branch, user });
  //       await queryRunner.manager.save(output);

  //       const restorePromises = details.map(async (detail) => {
  //         const { batchId, amount } = detail;
  //         const batchFound = await this.batchService.findOne(batchId);

  //         const detailFound = output.productOutput.find(
  //           (dt) => dt.batch.id === batchFound.id,
  //         );

  //         if (detailFound) {
  //           const newAmount = detailFound.amount - amount; //90-91=-1
  //           if (batchFound.stock + newAmount < 0)
  //             //0
  //             throw new Error('Stock insufiente en el lote');
  //           batchFound.stock += newAmount;
  //           await queryRunner.manager.save(batchFound);
  //           const product = await this.productService.findOne(
  //             batchFound.product.id,
  //           );

  //           if (product.stock + newAmount < 0)
  //             throw new Error('Stock insuficiente en el producto');
  //           product.stock += newAmount;
  //           await queryRunner.manager.save(product);

  //           if (amount !== 0) {
  //             queryRunner.manager.update(
  //               ProductOutputEntity,
  //               { id: detailFound.id },
  //               { amount: amount },
  //             );
  //           } else {
  //             await queryRunner.manager.delete(ProductOutputEntity, {
  //               id: detailFound.id,
  //             });
  //           }
  //         } else {
  //           const { batchId, amount } = detail;
  //           const batch = await this.batchService.findOne(batchId);
  //           if (!batch) throw new Error('Lote no encontrado');

  //           const product = await this.productService.findOne(batch.product.id);
  //           if (!product) throw new Error('Producto no encontrado');

  //           if (batch.stock < amount)
  //             throw new Error('Stock insuficiente en el producto');
  //           batch.stock -= amount;
  //           await queryRunner.manager.save(batch);

  //           if (product.stock < amount)
  //             throw new Error('Stock insuficiente en el producto');
  //           product.stock -= amount;
  //           await queryRunner.manager.save(product);
  //           const productOutput = this.productOutputRepository.create({
  //             amount,
  //             batch: { id: batchFound.id },
  //             output: { id: output.id },
  //           });
  //           await queryRunner.manager.save(productOutput);
  //         }
  //       });
  //       await Promise.all(restorePromises);
  //       //Borrar la salida si no tiene ningun producto de salida
  //       // const remainingDetails = await queryRunner.manager.count(
  //       //   ProductOutputEntity,
  //       //   {
  //       //     where: {
  //       //       output: { id: output.id },
  //       //     },
  //       //   },
  //       // );
  //       // if (remainingDetails === 0) {
  //       //   await queryRunner.manager.delete(OutputEntity, output.id);
  //       // }
  //       await queryRunner.commitTransaction();
  //       return await this.findOne(id);
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       throw new BadRequestException(error.message);
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async delete(id: string): Promise<ResponseMessage> {
  //   try {
  //     const queryRunner = this.dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();

  //     try {
  //       const output = await this.findOne(id);
  //       if (!output) throw new Error('Salida no encontrada');

  //       const promises = output.productOutput.map(async (detail) => {
  //         const { batch, amount } = detail;
  //         const batchFound = await this.batchService.findOne(batch.id);
  //         const product = await this.productService.findOne(
  //           batchFound.product.id,
  //         );

  //         batchFound.stock += amount;
  //         await queryRunner.manager.save(batchFound);

  //         product.stock += amount;
  //         await queryRunner.manager.save(product);
  //       });

  //       await Promise.all(promises);

  //       await this.productOutputRepository.delete({ output: { id } });

  //       await this.outputRepository.delete(id);

  //       await queryRunner.commitTransaction();

  //       return { statusCode: 200, message: 'Salida eliminada' };
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       throw new BadRequestException(error.message);
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }
}