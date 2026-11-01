import { MigrationInterface, QueryRunner } from 'typeorm';
import { DatabaseSchema } from '@takumi/database';

const SCHEMA = DatabaseSchema.CUSTOMERS;
const ENUM_NAME = 'customers_institutional_sector_enum';

export class RenameMunicipalInstitutionalSector1788048000000 implements MigrationInterface {
  name = 'RenameMunicipalInstitutionalSector1788048000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await renameEnumValue(queryRunner, 'MUNICIPAL', 'GOVERNMENTAL');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await renameEnumValue(queryRunner, 'GOVERNMENTAL', 'MUNICIPAL');
  }
}

async function renameEnumValue(
  queryRunner: QueryRunner,
  fromValue: string,
  toValue: string,
): Promise<void> {
  await queryRunner.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = '${SCHEMA}'
          AND t.typname = '${ENUM_NAME}'
          AND e.enumlabel = '${fromValue}'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = '${SCHEMA}'
          AND t.typname = '${ENUM_NAME}'
          AND e.enumlabel = '${toValue}'
      )
      THEN
        ALTER TYPE "${SCHEMA}"."${ENUM_NAME}" RENAME VALUE '${fromValue}' TO '${toValue}';
      END IF;
    END $$;
  `);
}
