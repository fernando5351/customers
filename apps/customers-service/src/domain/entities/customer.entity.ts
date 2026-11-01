import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';
import { BaseAuditEntity, DatabaseSchema } from '@takumi/database';
import { CustomerCompanyEntity } from './customer-company.entity';
import { CustomerIdentificationEntity } from './customer-identification.entity';
import { CustomerTaxProfileEntity } from './customer-tax-profile.entity';
import { CustomerTaxRoleEntity } from './customer-tax-role.entity';

export enum CustomerNature {
  NATURAL_PERSON = 'NATURAL_PERSON',
  LEGAL_ENTITY = 'LEGAL_ENTITY',
  UNION_OF_PERSONS = 'UNION_OF_PERSONS',
  DE_FACTO_PARTNERSHIP = 'DE_FACTO_PARTNERSHIP',
  FOREIGN_ENTITY = 'FOREIGN_ENTITY',
  OTHER = 'OTHER',
}

export enum InstitutionalSector {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
  GOVERNMENTAL = 'GOVERNMENTAL',
  INTERNATIONAL = 'INTERNATIONAL',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

export enum PublicEntityType {
  MINISTRY = 'MINISTRY',
  MUNICIPALITY = 'MUNICIPALITY',
  AUTONOMOUS_INSTITUTION = 'AUTONOMOUS_INSTITUTION',
  PUBLIC_COMPANY = 'PUBLIC_COMPANY',
  OTHER_PUBLIC_ENTITY = 'OTHER_PUBLIC_ENTITY',
}

@Entity({ schema: DatabaseSchema.CUSTOMERS, name: 'customers' })
@Index('ix_customers_legal_name', ['legalName'])
@Index('ix_customers_active', ['isActive'])
export class CustomerEntity extends BaseAuditEntity {
  @Column({
    name: 'nature',
    type: 'enum',
    enum: CustomerNature,
    enumName: 'customers_customer_nature_enum',
  })
  nature: CustomerNature;

  @Column({
    name: 'institutional_sector',
    type: 'enum',
    enum: InstitutionalSector,
    enumName: 'customers_institutional_sector_enum',
    default: InstitutionalSector.NOT_APPLICABLE,
  })
  institutionalSector: InstitutionalSector;

  @Column({
    name: 'public_entity_type',
    type: 'enum',
    enum: PublicEntityType,
    enumName: 'customers_public_entity_type_enum',
    nullable: true,
  })
  publicEntityType?: PublicEntityType | null;

  @Column({ name: 'legal_name', type: 'varchar', length: 200 })
  legalName: string;

  @Column({ name: 'trade_name', type: 'varchar', length: 200, nullable: true })
  tradeName?: string | null;

  @Column({ name: 'country_id', type: 'varchar', length: 2, default: 'SV' })
  countryId: string;

  @Column({ name: 'department_id', type: 'varchar', length: 2, nullable: true })
  departmentId?: string | null;

  @Column({ name: 'municipality_id', type: 'varchar', length: 36, nullable: true })
  municipalityId?: string | null;

  @Column({ name: 'address_complement', type: 'varchar', length: 300, nullable: true })
  addressComplement?: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 30, nullable: true })
  phone?: string | null;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email?: string | null;

  @OneToMany(() => CustomerIdentificationEntity, (identification) => identification.customer, {
    cascade: ['insert', 'update'],
  })
  identifications: CustomerIdentificationEntity[];

  @OneToOne(() => CustomerTaxProfileEntity, (taxProfile) => taxProfile.customer, {
    cascade: ['insert', 'update'],
  })
  taxProfile?: CustomerTaxProfileEntity | null;

  @OneToMany(() => CustomerTaxRoleEntity, (taxRole) => taxRole.customer, {
    cascade: ['insert', 'update'],
  })
  taxRoles: CustomerTaxRoleEntity[];

  @OneToMany(() => CustomerCompanyEntity, (company) => company.customer, {
    cascade: ['insert', 'update'],
  })
  companies: CustomerCompanyEntity[];
}
