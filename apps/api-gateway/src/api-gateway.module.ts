import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { CustomerCompanyContextGuard, SERVICE_NAMES, tcpClientOptions } from '@takumi/common';
import { TakumiConfig, TakumiConfigModule } from '@takumi/config';
import { DatabaseModule } from '@takumi/database';
import { CustomersGatewayController } from './customers-gateway.controller';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { TaxRolesGatewayController } from './tax-roles-gateway.controller';

@Module({
  imports: [
    TakumiConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [TakumiConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<TakumiConfig>) => ({
        secret: configService.getOrThrow('jwtSecret', { infer: true }),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: SERVICE_NAMES.CUSTOMERS,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const tcp = configService.getOrThrow('tcp');
          return tcpClientOptions(tcp.host, tcp.customersPort);
        },
      },
    ]),
  ],
  controllers: [HealthController, TaxRolesGatewayController, CustomersGatewayController],
  providers: [HealthService, CustomerCompanyContextGuard],
})
export class ApiGatewayModule {}
