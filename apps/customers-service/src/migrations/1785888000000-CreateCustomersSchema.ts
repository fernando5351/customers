import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
  TableForeignKey,
  TableIndex,
} from 'typeorm';
import { DatabaseSchema } from '@takumi/database';

const SCHEMA = DatabaseSchema.CUSTOMERS;

const TABLES = {
  customers: `${SCHEMA}.customers`,
  identifications: `${SCHEMA}.customer_identifications`,
  taxProfiles: `${SCHEMA}.customer_tax_profiles`,
  taxRoles: `${SCHEMA}.tax_roles`,
  customerTaxRoles: `${SCHEMA}.customer_tax_roles`,
  companies: `${SCHEMA}.customer_companies`,
} as const;

const ENUMS = {
  nature: 'customers_customer_nature_enum',
  institutionalSector: 'customers_institutional_sector_enum',
  publicEntityType: 'customers_public_entity_type_enum',
  identificationType: 'customers_identification_type_enum',
  vatStatus: 'customers_vat_status_enum',
  taxpayerCategory: 'customers_taxpayer_category_enum',
  taxRoleStatus: 'customers_tax_role_status_enum',
} as const;

export class CreateCustomersSchema1785888000000 implements MigrationInterface {
  name = 'CreateCustomersSchema1785888000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema(SCHEMA, true);

    await queryRunner.createTable(
      new Table({
        name: TABLES.customers,
        columns: [
          ...auditColumns(),
          enumColumn('nature', ENUMS.nature, [
            'NATURAL_PERSON',
            'LEGAL_ENTITY',
            'UNION_OF_PERSONS',
            'DE_FACTO_PARTNERSHIP',
            'FOREIGN_ENTITY',
            'OTHER',
          ]),
          enumColumn(
            'institutional_sector',
            ENUMS.institutionalSector,
            ['PRIVATE', 'PUBLIC', 'GOVERNMENTAL', 'INTERNATIONAL', 'NOT_APPLICABLE'],
            { default: "'NOT_APPLICABLE'" },
          ),
          enumColumn(
            'public_entity_type',
            ENUMS.publicEntityType,
            [
              'MINISTRY',
              'MUNICIPALITY',
              'AUTONOMOUS_INSTITUTION',
              'PUBLIC_COMPANY',
              'OTHER_PUBLIC_ENTITY',
            ],
            { isNullable: true },
          ),
          varcharColumn('legal_name', 200),
          varcharColumn('trade_name', 200, { isNullable: true }),
          varcharColumn('country_id', 2, { default: "'SV'" }),
          varcharColumn('department_id', 2, { isNullable: true }),
          varcharColumn('municipality_id', 36, { isNullable: true }),
          varcharColumn('address_complement', 300, { isNullable: true }),
          varcharColumn('phone', 30, { isNullable: true }),
          varcharColumn('email', 150, { isNullable: true }),
        ],
        indices: [
          new TableIndex({
            name: 'ix_customers_legal_name',
            columnNames: ['legal_name'],
          }),
          new TableIndex({
            name: 'ix_customers_active',
            columnNames: ['is_active'],
          }),
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: TABLES.identifications,
        columns: [
          ...auditColumns(),
          uuidColumn('customer_id'),
          enumColumn('type', ENUMS.identificationType, [
            'DUI',
            'NIT',
            'NRC',
            'PASSPORT',
            'RESIDENCE_CARD',
            'FOREIGN_TAX_ID',
            'GOVERNMENT_CODE',
            'OTHER',
          ]),
          varcharColumn('value', 50),
          varcharColumn('normalized_value', 50),
          varcharColumn('country_id', 2, { default: "'SV'" }),
          booleanColumn('is_primary', { default: trueToSql(false) }),
          timestampColumn('verified_at', { isNullable: true }),
        ],
        foreignKeys: [customerForeignKey('fk_customer_identifications_customer')],
        indices: [
          new TableIndex({
            name: 'ix_customer_identifications_customer',
            columnNames: ['customer_id'],
          }),
          new TableIndex({
            name: 'uq_customer_identifications_type_value_country',
            columnNames: ['type', 'normalized_value', 'country_id'],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          }),
          new TableIndex({
            name: 'uq_customer_identifications_primary',
            columnNames: ['customer_id'],
            isUnique: true,
            where: '"is_primary" = true AND "deleted_at" IS NULL',
          }),
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: TABLES.taxProfiles,
        columns: [
          ...auditColumns(),
          uuidColumn('customer_id'),
          enumColumn('vat_status', ENUMS.vatStatus, [
            'VAT_TAXPAYER',
            'NON_VAT_TAXPAYER',
            'EXCLUDED_SUBJECT',
            'FOREIGN_NON_DOMICILED',
            'UNKNOWN',
          ]),
          enumColumn(
            'taxpayer_category',
            ENUMS.taxpayerCategory,
            ['LARGE', 'MEDIUM', 'OTHER', 'NOT_APPLICABLE', 'UNKNOWN'],
            { default: "'NOT_APPLICABLE'" },
          ),
          varcharColumn('economic_activity_id', 6, { isNullable: true }),
          varcharColumn('economic_activity_description', 250, { isNullable: true }),
          timestampColumn('verified_at', { isNullable: true }),
          varcharColumn('verification_source', 250, { isNullable: true }),
          textColumn('notes', { isNullable: true }),
        ],
        foreignKeys: [customerForeignKey('fk_customer_tax_profiles_customer')],
        indices: [
          new TableIndex({
            name: 'uq_customer_tax_profiles_customer',
            columnNames: ['customer_id'],
            isUnique: true,
          }),
          new TableIndex({
            name: 'ix_customer_tax_profiles_vat_status',
            columnNames: ['vat_status'],
          }),
          new TableIndex({
            name: 'ix_customer_tax_profiles_taxpayer_category',
            columnNames: ['taxpayer_category'],
          }),
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: TABLES.taxRoles,
        columns: [
          ...auditColumns(),
          varcharColumn('code', 50),
          varcharColumn('name', 150),
          varcharColumn('description', 500, { isNullable: true }),
          decimalColumn('default_rate', 8, 6, { isNullable: true }),
          varcharColumn('legal_basis', 250, { isNullable: true }),
          booleanColumn('is_system', { default: trueToSql(false) }),
        ],
        indices: [
          new TableIndex({
            name: 'ux_tax_roles_code',
            columnNames: ['code'],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          }),
          new TableIndex({
            name: 'ix_tax_roles_active',
            columnNames: ['is_active'],
          }),
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: TABLES.customerTaxRoles,
        columns: [
          ...auditColumns(),
          uuidColumn('customer_id'),
          uuidColumn('tax_role_id'),
          enumColumn(
            'status',
            ENUMS.taxRoleStatus,
            ['ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION'],
            { default: "'PENDING_VERIFICATION'" },
          ),
          decimalColumn('rate', 8, 6, { isNullable: true }),
          varcharColumn('resolution_number', 100, { isNullable: true }),
          dateColumn('valid_from', { isNullable: true }),
          dateColumn('valid_until', { isNullable: true }),
          varcharColumn('verification_source', 250, { isNullable: true }),
          timestampColumn('verified_at', { isNullable: true }),
          varcharColumn('notes', 500, { isNullable: true }),
        ],
        foreignKeys: [
          customerForeignKey('fk_customer_tax_roles_customer'),
          taxRoleForeignKey('fk_customer_tax_roles_tax_role'),
        ],
        indices: [
          new TableIndex({
            name: 'ix_customer_tax_roles_customer',
            columnNames: ['customer_id'],
          }),
          new TableIndex({
            name: 'ix_customer_tax_roles_tax_role',
            columnNames: ['tax_role_id'],
          }),
          new TableIndex({
            name: 'uq_customer_tax_role',
            columnNames: ['customer_id', 'tax_role_id'],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          }),
        ],
      }),
      true,
      true,
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: TABLES.companies,
        columns: [...auditColumns(), uuidColumn('customer_id'), uuidColumn('company_id')],
        foreignKeys: [customerForeignKey('fk_customer_companies_customer')],
        indices: [
          new TableIndex({
            name: 'ix_customer_companies_company',
            columnNames: ['company_id'],
          }),
          new TableIndex({
            name: 'uq_customer_companies_customer_company',
            columnNames: ['customer_id', 'company_id'],
            isUnique: true,
            where: '"deleted_at" IS NULL',
          }),
        ],
      }),
      true,
      true,
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLES.companies, true, true, true);
    await queryRunner.dropTable(TABLES.customerTaxRoles, true, true, true);
    await queryRunner.dropTable(TABLES.taxRoles, true, true, true);
    await queryRunner.dropTable(TABLES.taxProfiles, true, true, true);
    await queryRunner.dropTable(TABLES.identifications, true, true, true);
    await queryRunner.dropTable(TABLES.customers, true, true, true);
    await queryRunner.dropSchema(SCHEMA, true, true);
  }
}

function auditColumns(): TableColumnOptions[] {
  return [
    uuidColumn('id', { isPrimary: true, default: 'gen_random_uuid()' }),
    booleanColumn('is_active', { default: trueToSql(true) }),
    timestampColumn('created_at', { default: 'now()' }),
    timestampColumn('updated_at', { isNullable: true, default: 'now()' }),
    timestampColumn('deleted_at', { isNullable: true }),
    uuidColumn('created_by', { isNullable: true }),
    uuidColumn('updated_by', { isNullable: true }),
    uuidColumn('deleted_by', { isNullable: true }),
  ];
}

function customerForeignKey(name: string): TableForeignKey {
  return new TableForeignKey({
    name,
    columnNames: ['customer_id'],
    referencedSchema: SCHEMA,
    referencedTableName: 'customers',
    referencedColumnNames: ['id'],
    onDelete: 'CASCADE',
  });
}

function taxRoleForeignKey(name: string): TableForeignKey {
  return new TableForeignKey({
    name,
    columnNames: ['tax_role_id'],
    referencedSchema: SCHEMA,
    referencedTableName: 'tax_roles',
    referencedColumnNames: ['id'],
    onDelete: 'RESTRICT',
  });
}

function uuidColumn(name: string, options: Partial<TableColumnOptions> = {}): TableColumnOptions {
  return {
    name,
    type: 'uuid',
    isNullable: false,
    ...options,
  };
}

function booleanColumn(
  name: string,
  options: Partial<TableColumnOptions> = {},
): TableColumnOptions {
  return {
    name,
    type: 'boolean',
    isNullable: false,
    ...options,
  };
}

function timestampColumn(
  name: string,
  options: Partial<TableColumnOptions> = {},
): TableColumnOptions {
  return {
    name,
    type: 'timestamp',
    isNullable: false,
    ...options,
  };
}

function dateColumn(name: string, options: Partial<TableColumnOptions> = {}): TableColumnOptions {
  return {
    name,
    type: 'date',
    isNullable: false,
    ...options,
  };
}

function varcharColumn(
  name: string,
  length: number,
  options: Partial<TableColumnOptions> = {},
): TableColumnOptions {
  return {
    name,
    type: 'varchar',
    length: String(length),
    isNullable: false,
    ...options,
  };
}

function textColumn(name: string, options: Partial<TableColumnOptions> = {}): TableColumnOptions {
  return {
    name,
    type: 'text',
    isNullable: false,
    ...options,
  };
}

function decimalColumn(
  name: string,
  precision: number,
  scale: number,
  options: Partial<TableColumnOptions> = {},
): TableColumnOptions {
  return {
    name,
    type: 'decimal',
    precision,
    scale,
    isNullable: false,
    ...options,
  };
}

function enumColumn(
  name: string,
  enumName: string,
  values: string[],
  options: Partial<TableColumnOptions> = {},
): TableColumnOptions {
  return {
    name,
    type: 'enum',
    enumName,
    enum: values,
    isNullable: false,
    ...options,
  };
}

function trueToSql(value: boolean): string {
  return value ? 'true' : 'false';
}
