import { Entity, OneToMany } from 'typeorm';
import { Column } from 'typeorm/decorator/columns/Column';

import { BaseEntity } from 'src/common/entities/base.entity';
import { BuyEntity } from './buy.entity';

export interface IProvider {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  nit: string;
  detail?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  buys?: BuyEntity[];
}

@Entity({ name: 'provider' })
export class ProviderEntity extends BaseEntity implements IProvider {
  @Column({ type: 'varchar', nullable: false, length: 100 })
  name: string;

  @Column({ type: 'varchar', nullable: true, length: 15 })
  phone: string;

  @Column({ type: 'varchar', nullable: true, length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  address: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  nit: string;

  @Column({ type: 'varchar', nullable: true, length: 500 })
  detail: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  is_active: boolean;

  @OneToMany(() => BuyEntity, buy => buy.provider, { nullable: true, onDelete: 'CASCADE' })
  buys: BuyEntity[];

}