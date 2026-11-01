import 'dotenv/config';
import { DataSource } from 'typeorm';
import { readAppConfig } from '@takumi/config';

const cfg = readAppConfig();

export default new DataSource({
  type: 'postgres',
  host: cfg.database.host,
  port: cfg.database.port,
  username: cfg.database.username,
  password: cfg.database.password,
  database: cfg.database.name,
  schema: cfg.database.schema,
  connectTimeoutMS: 10000,
  synchronize: false,
  migrationsRun: false,
  uuidExtension: 'pgcrypto',
  installExtensions: true,
  logging: cfg.database.logging,
  extra: { max: cfg.database.poolMax },
  ssl: cfg.database.ssl ? { rejectUnauthorized: false } : false,
  entities: ['apps/**/*.entity.ts', 'libs/**/*.entity.ts'],
  migrations: ['apps/**/src/migrations/*{.ts,.js}', 'libs/database/src/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
});
