import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseAuditEntity, DatabaseSchema } from '@takumi/database';
import { CustomerEntity } from './customer.entity';

export enum VatStatus {
  VAT_TAXPAYER = 'VAT_TAXPAYER',
  NON_VAT_TAXPAYER = 'NON_VAT_TAXPAYER',
  EXCLUDED_SUBJECT = 'EXCLUDED_SUBJECT',
  FOREIGN_NON_DOMICILED = 'FOREIGN_NON_DOMICILED',
  UNKNOWN = 'UNKNOWN',
}

export enum TaxpayerCategory {
  LARGE = 'LARGE',
  MEDIUM = 'MEDIUM',
  OTHER = 'OTHER',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  UNKNOWN = 'UNKNOWN',
}

@Entity({ schema: DatabaseSchema.CUSTOMERS, name: 'customer_tax_profiles' })
export class CustomerTaxProfileEntity extends BaseAuditEntity {
  @Column({ name: 'customer_id', type: 'uuid', unique: true })
  customerId: string;

  @OneToOne(() => CustomerEntity, (customer) => customer.taxProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({
    name: 'vat_status',
    type: 'enum',
    enum: VatStatus,
    enumName: 'customers_vat_status_enum',
  })
  vatStatus: VatStatus;

  @Column({
    name: 'taxpayer_category',
    type: 'enum',
    enum: TaxpayerCategory,
    enumName: 'customers_taxpayer_category_enum',
    default: TaxpayerCategory.NOT_APPLICABLE,
  })
  taxpayerCategory: TaxpayerCategory;

  @Column({ name: 'economic_activity_id', type: 'varchar', length: 6, nullable: true })
  economicActivityId?: string | null;

  @Column({
    name: 'economic_activity_description',
    type: 'varchar',
    length: 250,
    nullable: true,
  })
  economicActivityDescription?: string | null;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;

  @Column({ name: 'verification_source', type: 'varchar', length: 250, nullable: true })
  verificationSource?: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string | null;
}
