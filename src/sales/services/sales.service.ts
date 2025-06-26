import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { UserService } from "src/users/services/users.service";
import { ProductService } from "src/inventory/services/product.service";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { QueryDto } from "src/common/dto/query.dto";
import { SaleDetailEntity, SaleEntity } from "../entities/sales.entity";
import { CreateSaleDto } from "../dto/sales.dto";
import { getDate, handlerError } from "src/common/utils";
import { ROLES } from "src/common/constants";
import { ResponseGet } from "src/common/interfaces/responseMessage.interface";
import { WebsocketGateway } from "src/websocket/websocket.gateway";

@Injectable()
export class SaleNoteService {

  private readonly logger = new Logger('SaleNoteService');

  constructor(
    @InjectRepository(SaleEntity) private readonly saleNoteRepository: Repository<SaleEntity>,
    @InjectRepository(SaleDetailEntity) private readonly saleDetailRepository: Repository<SaleDetailEntity>,
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly dataSources: DataSource,
    private readonly webSocketGateway: WebsocketGateway,
  ) { }

  public async create(createSaleDto: CreateSaleDto, userId: string): Promise<SaleEntity> {
    try {
      const { details, customerName, nit, ...rest } = createSaleDto;
      const { date, time } = getDate();
      this.logger.log({
        details, customerName, nit, ...rest
      });
      const user = await this.userService.findOne(userId);
      this.logger.log(user.name);
      // transaction
      const queryRunner = this.dataSources.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        let customerFound = await this.userService.findOneBy({ key: 'nit', value: nit });
        // find hose
        if (!customerFound) {
          // save customer
          // const NewCustomer = this.customerRepository.create({
          //   name: customerName, nit, plate, monthlyAmountSold: 0, lastDateSold: ''
          // });
          const NewCustomer = await this.userService.createUser({
            name: customerName,
            nit,
            role: ROLES.CLIENT,
            email: `${customerName.replace(/\s+/g, '').toLowerCase()}@client.com`,
            password: 'defaultPassword123', // You should handle password securely
            phone: '', // Add phone if needed
            country_code: 'BO', // Assuming Bolivia, change if needed
            photo_url: '',
            last_name: '', // Add last name if needed
          })
          await queryRunner.manager.save(NewCustomer);
          customerFound = NewCustomer;
        }

        // save note
        const saleNote = this.saleNoteRepository.create({
          ...rest, date, time,
          seller: { id: user.id },
          customer: { id: rest.customerId ? rest.customerId : customerFound.id }
        });
        const saleNoteSaved = await queryRunner.manager.save(saleNote);

        // save detail
        const promises = details.map(async detail => {
          const { amount, price } = detail;
          const product = await this.productService.findOne(detail.productId);
          if (product.stock < amount) throw new BadRequestException('Stock insuficiente en el producto: ' + product.name);
          product.stock -= amount;
          await queryRunner.manager.save(product);

          const saleDetail = this.saleDetailRepository.create({
            sale: { id: saleNoteSaved.id }, subTotal: amount * price, price, amount,
            product: { id: product.id }
          });
          await queryRunner.manager.save(saleDetail);
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
        return saleNoteSaved;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(error.message);
      } finally {
        await queryRunner.release()
      }
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findAll(queryDto: QueryDto): Promise<ResponseGet> {
    try {
      const { attr, value, limit, offset, order } = queryDto;
      const query = this.saleNoteRepository.createQueryBuilder('sale');
      query.leftJoinAndSelect('sale.seller', 'seller');
      query.leftJoinAndSelect('sale.customer', 'customer');
      query.leftJoinAndSelect('sale.saleDetails', 'saleDetails');
      query.leftJoinAndSelect('saleDetails.product', 'product');
      query.orderBy('sale.createdAt', 'DESC');

      if (limit) query.take(limit);
      if (offset) query.skip(offset);
      if (order) query.orderBy('sale.createdAt', order.toLocaleUpperCase() as any);
      if (attr && value) query.andWhere(`sale.${attr} ILIKE :value`, { value: `%${value}%` });
      return {
        data: await query.getMany(),
        countData: await query.getCount(),
      };
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  public async findOne(id: string): Promise<SaleEntity> {
    try {
      return await this.saleNoteRepository.findOne({
        where: { id },
        relations: [
          'seller', 'customer', 'saleDetails', 'saleDetails.product'
        ]
      });
    } catch (error) {
      handlerError(error, this.logger);
    }
  }

  // public async remove(id: string): Promise<ResponseMessage> {
  //   try {
  //     const saleNote = await this.findOne(id);
  //     if (!saleNote) throw new NotFoundException('Venta no encontrada');

  //     // verify that no more than 10 minutes have passed
  //     if (this.verifytime(saleNote.date, saleNote.time)) throw new BadRequestException('No puedes borrar la nota de venta, han pasado más de 24 horas.');

  //     // transaction
  //     const queryRunner = this.dataSources.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();
  //     try {
  //       // delete details
  //       const promises = saleNote.saleDetails.map(async detalle => {
  //         const { amount, batch, tank } = detalle;

  //         //update tank stock
  //         if (tank) {
  //           const tankfound = await this.tankService.findOne(tank.id);
  //           tankfound.stock += amount;
  //           await queryRunner.manager.save(tankfound);
  //           const product = await this.productService.findOne(tankfound.product.id);
  //           product.stock += amount;
  //           await queryRunner.manager.save(product)
  //         } else {
  //           // update batch stock
  //           const batchfound = await this.batchService.findOne(batch.id);
  //           batchfound.stock += amount;
  //           await queryRunner.manager.save(batchfound);
  //           const product = await this.productService.findOne(batchfound.product.id);
  //           product.stock += amount;
  //           await queryRunner.manager.save(product)
  //         }

  //         await queryRunner.manager.delete(SaleDetailEntity, detalle.id);
  //       });
  //       await Promise.all(promises);
  //       await queryRunner.manager.delete(SaleEntity, saleNote.id);
  //       await queryRunner.commitTransaction();
  //       return {
  //         message: 'Sale Note deleted successfully',
  //         statusCode: 200
  //       };
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

  // private verifytime(dateNote: string, timeNote: string): boolean {
  //   try {
  //     const { date, time } = getDate()
  //     const formatDate = date.split('/')
  //     const formatTime = time.split(' ')
  //     const currentDate = new Date(`${formatDate[1]}/${formatDate[0]}/${formatDate[2]} ${formatTime[0]} ${formatTime[1] === 'a. m.' ? 'am' : 'pm'}}`)
  //     const formatDateNote = dateNote.split('/')
  //     const formatTimeNote = timeNote.split(' ')
  //     const lastDateNote = new Date(`${formatDateNote[1]}/${formatDateNote[0]}/${formatDateNote[2]} ${formatTimeNote[0]} ${formatTimeNote[1] === 'a. m.' ? 'am' : 'pm'}}`)

  //     const diff = currentDate.getTime() - lastDateNote.getTime()
  //     const hours = Math.floor(diff / 1000 / 60 / 60)
  //     return hours >= 24
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }

  // public async getSalesReport(querySalesDto: QuerySalesDto): Promise<SaleEntity[]> {
  //   try {
  //     const { start_date, end_date, branchId, nit, userId } = querySalesDto;
  //     const query = this.saleNoteRepository.createQueryBuilder('saleNote');
  //     query.leftJoinAndSelect('saleNote.seller', 'seller');
  //     query.leftJoinAndSelect('saleNote.branch', 'branch');
  //     query.leftJoinAndSelect('saleNote.saleDetails', 'saleDetails');
  //     query.leftJoinAndSelect('saleNote.customer', 'customer');

  //     const user = await this.userService.findOne(userId)
  //     if (user.role.name === ROLE.ADMIN) {
  //       if (branchId) query.where('branch.id = :branch', { branchId })
  //     } else {
  //       query.where('branch.id = :branch', { branch: user.branch.id })
  //     }

  //     if (userId) query.andWhere('seller.id = :userId', { userId });
  //     if (nit) query.andWhere('customer.nit = :nit', { nit });
  //     if (start_date && end_date) query.andWhere('saleNote.date BETWEEN :start_date AND :end_date', { start_date, end_date });
  //     return await query.getMany();
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getLastCode(branchId: string): Promise<number> {
  //   try {
  //     const branch = await this.branchService.findOne(branchId);
  //     const sale = await this.saleNoteRepository.findOne({
  //       where: { branch: { id: branch.id } },
  //       order: { code: 'DESC' }
  //     });
  //     return sale ? Number(sale.code) : 0;
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getSalesPerDate(data: GetDateByBranch): Promise<SaleEntity[]> {
  //   if (!data.branchId) throw new BadRequestException('Usuario no tiene una sucursal asignada');
  //   let firstDay: Date; let lastDay: Date;
  //   if (!data.day) {
  //     firstDay = new Date(data.year, data.month - 1, 1);
  //     lastDay = new Date(data.year, data.month, 0);
  //   } else {
  //     firstDay = new Date(data.year, data.month - 1, data.day);
  //     lastDay = new Date(data.year, data.month - 1, data.day + 1);
  //   }
  //   const query = this.saleNoteRepository.createQueryBuilder('saleNote');
  //   query.leftJoinAndSelect('saleNote.saleDetails', 'saleDetails');
  //   query.where('saleNote.branch = :branchId', { branchId: data.branchId });
  //   query.andWhere('saleNote.created_at BETWEEN :firstDay and :lastDay', { firstDay: firstDay, lastDay: lastDay });
  //   return await query.getMany();
  // }

  // public async salesPerYear(year: number, branchId: string): Promise<ResponseGetDate> {
  //   try {
  //     let data: ResponseGetDate[] = [];
  //     let countData = 0;
  //     for (let index = 1; index <= 12; index++) {
  //       const sales = await this.getSalesPerMonth({ year, month: index, branchId });
  //       data.push({ countData: sales.countData, discount: sales.discount, total: sales.total, month: sales.month });
  //       countData += sales.countData;
  //     }
  //     return { data, countData };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getSalesPerMonth(data: GetDateByBranch): Promise<ResponseGetDate> {
  //   try {
  //     const notes = await this.getSalesPerDate(data);
  //     let total: number = 0; let discounts: number = 0;
  //     notes.map(async (note) => {
  //       total += note.amountReceivable;
  //       discounts += note.discount
  //     });
  //     return {
  //       data: notes,
  //       countData: notes.length,
  //       total: total,
  //       discount: discounts,
  //       month: months[data.month - 1]
  //     };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getSalesPerDay(data: GetDateByBranch): Promise<ResponseGetDate> {
  //   try {
  //     const notes = await this.getSalesPerDate(data);
  //     let total: number = 0; let discounts: number = 0;
  //     notes.map(async (note) => {
  //       total += note.amountReceivable;
  //       discounts += note.discount;
  //     });
  //     return {
  //       data: notes,
  //       countData: notes.length,
  //       total: total,
  //       discount: discounts,
  //       month: months[data.month - 1],
  //       day: data.day
  //     };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async salesPerMount(year: number, month: number, branchId: string): Promise<ResponseGetDate> {
  //   try {
  //     const lastDate = new Date(year, month, 0);
  //     const lastDay = lastDate.getDate();
  //     let countData = 0;
  //     let data: ResponseGetDate[] = [];
  //     for (let index = 1; index <= lastDay; index++) {
  //       const sales = await this.getSalesPerDay({ year, month, day: index, branchId });
  //       data.push({ countData: sales.countData, discount: sales.discount, total: sales.total, month: sales.month, day: index });
  //       countData += sales.countData;
  //     }
  //     return { data, countData };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getProductPerDay(data: GetDateByBranch): Promise<ResponseGetDate> {
  //   try {
  //     const notes = await this.getSalesPerDate(data);
  //     let products: string[] = [];
  //     let productsList: ResponseGetProduct[] = [];
  //     notes.map(async (note) => {
  //       try {
  //         note.saleDetails.map(async (detail) => {
  //           try {
  //             const product: ProductEntity = detail.batch ? detail.batch.product : detail.tank.product
  //             const index = products.findIndex((product) => {
  //               return product === detail.batch.product.id;
  //             });
  //             if (index === -1) {
  //               products.push(product.id);
  //               productsList.push({ product, count: detail.amount });
  //             } else {
  //               const newCount = productsList[index].count + detail.amount;
  //               productsList[index] = { product: productsList[index].product, count: newCount };
  //             }
  //           } catch (error) {
  //             throw new BadRequestException(error.message);
  //           }
  //         });
  //       } catch (error) {
  //         throw new BadRequestException(error.message);
  //       }
  //     });
  //     productsList.sort((a, b) => {
  //       const countA = a.count;
  //       const countB = b.count;
  //       return (countA > countB) ? -1 : (countA < countB) ? 1 : 0;
  //     });
  //     return {
  //       data: productsList,
  //       countData: productsList.length,
  //       month: months[data.month - 1],
  //       day: data.day
  //     };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async productsoldPerMonth(year: number, month: number, branchId: string): Promise<ResponseGet> {
  //   try {
  //     const lastDate = new Date(year, month, 0);
  //     const lastDay = lastDate.getDate();
  //     let countData = 0;
  //     let data: ResponseGetDate[] = [];
  //     for (let index = 1; index <= lastDay; index++) {
  //       const products = await this.getProductPerDay({ year, month, day: index, branchId });
  //       data.push({ countData: products.countData, data: products.data, month: products.month, day: index });
  //       countData += products.countData;
  //     }
  //     return { data, countData };
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

  // public async getOneCustomer(customerId: string): Promise<CustomerEntity> {
  //   try {
  //     const customer = await this.customerRepository.findOne({
  //       where: { id: customerId }
  //     });
  //     if (!customer) throw new NotFoundException('Cliente no encontrado');
  //     return customer
  //   } catch (error) {
  //     handlerError(error, this.logger);
  //   }
  // }

}