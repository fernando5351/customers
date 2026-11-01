import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseAuditEntity, DatabaseSchema, decimalNumberTransformer } from '@takumi/database';
import { CustomerEntity } from './customer.entity';
import { TaxRoleEntity } from './tax-role.entity';

export enum CustomerTaxRoleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

@Entity({ schema: DatabaseSchema.CUSTOMERS, name: 'customer_tax_roles' })
@Index('ix_customer_tax_roles_customer', ['customerId'])
@Index('ix_customer_tax_roles_tax_role', ['taxRoleId'])
@Index('uq_customer_tax_role', ['customerId', 'taxRoleId'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class CustomerTaxRoleEntity extends BaseAuditEntity {
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.taxRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @Column({ name: 'tax_role_id', type: 'uuid' })
  taxRoleId: string;

  @ManyToOne(() => TaxRoleEntity, (taxRole) => taxRole.customerTaxRoles, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'tax_role_id' })
  taxRole: TaxRoleEntity;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CustomerTaxRoleStatus,
    enumName: 'customers_tax_role_status_enum',
    default: CustomerTaxRoleStatus.PENDING_VERIFICATION,
  })
  status: CustomerTaxRoleStatus;

  @Column({
    name: 'rate',
    type: 'decimal',
    precision: 8,
    scale: 6,
    nullable: true,
    transformer: decimalNumberTransformer,
  })
  rate?: number | null;

  @Column({ name: 'resolution_number', type: 'varchar', length: 100, nullable: true })
  resolutionNumber?: string | null;

  @Column({ name: 'valid_from', type: 'date', nullable: true })
  validFrom?: string | null;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil?: string | null;

  @Column({ name: 'verification_source', type: 'varchar', length: 250, nullable: true })
  verificationSource?: string | null;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;

  @Column({ name: 'notes', type: 'varchar', length: 500, nullable: true })
  notes?: string | null;
}
