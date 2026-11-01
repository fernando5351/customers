import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TakumiConfig } from '@takumi/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TakumiConfig>) => {
        const database = configService.getOrThrow('database', { infer: true });

        return {
          type: 'postgres' as const,
          host: database.host,
          port: database.port,
          username: database.username,
          password: database.password,
          database: database.name,
          schema: database.schema,
          connectTimeoutMS: 10000,
          autoLoadEntities: true,
          synchronize: false,
          migrationsRun: false,
          uuidExtension: 'pgcrypto',
          installExtensions: true,
          logging: database.logging,
          extra: { max: database.poolMax },
          ssl: database.ssl ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
