import dataSource from './data-source';
import { readAppConfig } from '@takumi/config';

type MigrationCommand = 'run' | 'show' | 'revert';

const command = process.argv[2] as MigrationCommand | undefined;

async function main(): Promise<void> {
  if (!command || !['run', 'show', 'revert'].includes(command)) {
    throw new Error('Usage: migration-command.ts <run|show|revert>');
  }

  console.log('Initializing database connection...');
  await dataSource.initialize();
  console.log('Database connection initialized.');

  try {
    await ensureMigrationsSchema();

    if (command === 'run') {
      console.log('Running pending migrations...');
      const migrations = await dataSource.runMigrations();

      if (!migrations.length) {
        console.log('No pending migrations.');
        return;
      }

      for (const migration of migrations) {
        console.log(`Executed migration: ${migration.name}`);
      }

      return;
    }

    if (command === 'show') {
      console.log('Checking pending migrations...');
      const hasPendingMigrations = await dataSource.showMigrations();

      console.log(
        hasPendingMigrations ? 'There are pending migrations.' : 'No pending migrations.',
      );
      return;
    }

    console.log('Reverting last migration...');
    await dataSource.undoLastMigration();
    console.log('Reverted last migration.');
  } finally {
    await dataSource.destroy();
  }
}

async function ensureMigrationsSchema(): Promise<void> {
  const { database } = readAppConfig();

  if (!database.schema) {
    return;
  }

  console.log(`Ensuring migrations schema "${database.schema}" exists...`);
  await dataSource.query(`CREATE SCHEMA IF NOT EXISTS ${quoteIdentifier(database.schema)}`);
  console.log(`Migrations schema "${database.schema}" is ready.`);
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
