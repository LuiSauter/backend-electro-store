import { Entity, OneToMany } from 'typeorm';
import { Column } from 'typeorm/decorator/columns/Column';
import { Exclude } from 'class-transformer';

import { BaseEntity } from 'src/common/entities/base.entity';
import { ROLES } from 'src/common/constants';
import { IUser } from '../interfaces/user.interface';
import { BuyEntity } from 'src/buy/entities/buy.entity';
import { SaleEntity } from 'src/sales/entities/sales.entity';

@Entity({ name: 'user' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  last_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  photo_url: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  nit: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  country_code: string;

  @Column({ type: 'enum', enum: ROLES, nullable: false })
  role: ROLES;

  @Column({ type: 'bool', default: false })
  is_suspended: boolean;

  @OneToMany(() => BuyEntity, buy => buy.user, { nullable: false, onDelete: 'CASCADE' })
  buys: BuyEntity[];

  @OneToMany(() => SaleEntity, sale => sale.seller, { nullable: false, onDelete: 'CASCADE' })
  salesSeller: SaleEntity[];

  @OneToMany(() => SaleEntity, sale => sale.customer, { nullable: false, onDelete: 'CASCADE' })
  salesCustomer: SaleEntity[];
}
