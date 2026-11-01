import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditEntity, DatabaseSchema } from '@takumi/database';
import { CustomerEntity } from './customer.entity';

export enum CustomerIdentificationType {
  DUI = 'DUI',
  NIT = 'NIT',
  NRC = 'NRC',
  PASSPORT = 'PASSPORT',
  RESIDENCE_CARD = 'RESIDENCE_CARD',
  FOREIGN_TAX_ID = 'FOREIGN_TAX_ID',
  GOVERNMENT_CODE = 'GOVERNMENT_CODE',
  OTHER = 'OTHER',
}

@Entity({ schema: DatabaseSchema.CUSTOMERS, name: 'customer_identifications' })
@Index('ix_customer_identifications_customer', ['customerId'])
@Index(
  'uq_customer_identifications_type_value_country',
  ['type', 'normalizedValue', 'countryId'],
  {
    unique: true,
    where: '"deleted_at" IS NULL',
  },
)
@Index('uq_customer_identifications_primary', ['customerId'], {
  unique: true,
  where: '"is_primary" = true AND "deleted_at" IS NULL',
})
export class CustomerIdentificationEntity extends BaseAuditEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.identifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({
    name: 'type',
    type: 'enum',
    enum: CustomerIdentificationType,
    enumName: 'customers_identification_type_enum',
  })
  type: CustomerIdentificationType;

  @Column({ name: 'value', type: 'varchar', length: 50 })
  value: string;

  @Column({ name: 'normalized_value', type: 'varchar', length: 50 })
  normalizedValue: string;

  @Column({ name: 'country_id', type: 'varchar', length: 2, default: 'SV' })
  countryId: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;
}
