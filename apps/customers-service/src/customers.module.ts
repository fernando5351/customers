import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerCompanyContextGuard, InternalApiKeyGuard } from '@takumi/common';
import { TakumiConfig, TakumiConfigModule } from '@takumi/config';
import { DatabaseModule } from '@takumi/database';
import { CustomersService } from './application/customers.service';
import {
  CustomerCompanyEntity,
  CustomerEntity,
  CustomerIdentificationEntity,
  CustomerTaxProfileEntity,
  CustomerTaxRoleEntity,
  TaxRoleEntity,
} from './domain/entities';
import { CustomerFiscalValidator } from './domain/validators/customer-fiscal.validator';
import { CreateCustomerService } from './application/use-cases/create-customer.service';
import { UpdateCustomerService } from './application/use-cases/update-customer.service';
import { CustomerTaxRoleCatalogValidator } from './application/validation/customer-tax-role-catalog.validator';
import { TaxRolesService } from './application/tax-roles.service';
import { CustomersRepository } from './infrastructure/repositories/customers.repository';
import { TaxRolesRepository } from './infrastructure/repositories/tax-roles.repository';
import { CustomersHttpController } from './transport/http/customers-http.controller';
import { InternalCustomersHttpController } from './transport/http/internal-customers-http.controller';
import { TaxRolesHttpController } from './transport/http/tax-roles-http.controller';
import { CustomersRpcController } from './transport/rpc/customers-rpc.controller';
import { TaxRolesRpcController } from './transport/rpc/tax-roles-rpc.controller';

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
    TypeOrmModule.forFeature([
      CustomerEntity,
      CustomerIdentificationEntity,
      CustomerTaxProfileEntity,
      CustomerTaxRoleEntity,
      CustomerCompanyEntity,
      TaxRoleEntity,
    ]),
  ],
  controllers: [
    CustomersRpcController,
    TaxRolesRpcController,
    CustomersHttpController,
    InternalCustomersHttpController,
    TaxRolesHttpController,
  ],
  providers: [
    CustomersService,
    TaxRolesService,
    CreateCustomerService,
    UpdateCustomerService,
    CustomerTaxRoleCatalogValidator,
    CustomerFiscalValidator,
    CustomersRepository,
    TaxRolesRepository,
    CustomerCompanyContextGuard,
    InternalApiKeyGuard,
  ],
})
export class CustomersModule {}
