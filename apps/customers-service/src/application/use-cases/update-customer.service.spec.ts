import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { mock, test } from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CustomerCompanyEntity,
  CustomerEntity,
  CustomerIdentificationType,
  CustomerNature,
  InstitutionalSector,
  PublicEntityType,
  TaxpayerCategory,
  VatStatus,
} from '../../domain/entities';
import { CustomerFiscalValidator } from '../../domain/validators/customer-fiscal.validator';
import { CustomersRepository } from '../../infrastructure/repositories/customers.repository';
import { CustomerTaxRoleCatalogValidator } from '../validation/customer-tax-role-catalog.validator';
import { CreateCustomerInput } from '../dto/customer.dto';
import { CreateCustomerService } from './create-customer.service';
import { CustomersService } from '../customers.service';
import { validatePayload } from '@takumi/common';
import { updateCustomerSchema } from '../validation/customer.schemas';
import { UpdateCustomerService } from './update-customer.service';
import { UpdateCustomerInput } from '../dto/customer.dto';

const COMPANY_ID = 'eebaa122-bb48-4cb0-9e45-2310ccf7ce28';

function setup() {
  const customer = Object.assign(new CustomerEntity(), {
    id: 'e659ddcf-5dfa-4da2-904e-f251fc1ff850',
    nature: CustomerNature.LEGAL_ENTITY,
    institutionalSector: InstitutionalSector.GOVERNMENTAL,
    publicEntityType: PublicEntityType.MUNICIPALITY,
    legalName: 'Alcaldía',
    countryId: 'SV',
    isActive: true,
    createdAt: new Date(),
    identifications: [
      {
        type: CustomerIdentificationType.NRC,
        value: '123456-7',
        normalizedValue: '1234567',
        countryId: 'SV',
        isPrimary: true,
      },
    ],
    taxProfile: { vatStatus: VatStatus.VAT_TAXPAYER, taxpayerCategory: TaxpayerCategory.OTHER },
    taxRoles: [],
    companies: [],
  });
  const repository = {
    findById: mock.fn(async () => customer as CustomerEntity | null),
    update: mock.fn(async (_input: UpdateCustomerInput) => customer as CustomerEntity | null),
  };
  const catalog = { validate: mock.fn(async () => {}) };
  const service = new UpdateCustomerService(
    repository as unknown as CustomersRepository,
    new CustomerFiscalValidator(),
    catalog as unknown as CustomerTaxRoleCatalogValidator,
  );
  return { customer, repository, catalog, service };
}

test('a scalar PATCH validates against existing fiscal and institutional fields without replacing collections', async () => {
  const { customer, repository, service } = setup();
  const input = validatePayload(updateCustomerSchema, {
    id: customer.id,
    legalName: 'Nueva alcaldía',
  });
  assert.equal(await service.execute(input, COMPANY_ID), customer);
  assert.deepEqual(repository.update.mock.calls[0].arguments[0], {
    id: customer.id,
    legalName: 'Nueva alcaldía',
  });
});

test('removing the NRC of an existing VAT taxpayer is rejected before persistence', async () => {
  const { customer, repository, service } = setup();
  await assert.rejects(
    service.execute({ id: customer.id, identifications: [] }, COMPANY_ID),
    BadRequestException,
  );
  assert.equal(repository.update.mock.callCount(), 0);
});

test('an invalid institutional sector transition is rejected using the existing public entity type', async () => {
  const { customer, repository, service } = setup();
  await assert.rejects(
    service.execute(
      { id: customer.id, institutionalSector: InstitutionalSector.PRIVATE },
      COMPANY_ID,
    ),
    BadRequestException,
  );
  assert.equal(repository.update.mock.callCount(), 0);
});

test('a missing customer returns not found without writing', async () => {
  const { customer, repository, service } = setup();
  repository.findById.mock.mockImplementation(async () => null);
  await assert.rejects(
    service.execute({ id: customer.id, legalName: 'Nuevo nombre' }, COMPANY_ID),
    NotFoundException,
  );
  assert.equal(repository.update.mock.callCount(), 0);
});

test('a newly assigned role must pass catalog validation before writing', async () => {
  const { customer, repository, catalog, service } = setup();
  catalog.validate.mock.mockImplementation(async () => {
    throw new BadRequestException('Rol inexistente');
  });
  await assert.rejects(
    service.execute({ id: customer.id, taxRoles: [{ taxRoleId: 'missing-role' }] }, COMPANY_ID),
    BadRequestException,
  );
  assert.equal(repository.update.mock.callCount(), 0);
});

test('a customer cannot be updated without a company context', async () => {
  const { customer, repository, service } = setup();
  await assert.rejects(
    service.execute({ id: customer.id, legalName: 'Nuevo nombre' }, ''),
    BadRequestException,
  );
  assert.equal(repository.findById.mock.callCount(), 0);
});

test('customer creation requires and forwards the company context', async () => {
  const customer = new CustomerEntity();
  const input: CreateCustomerInput = {
    nature: CustomerNature.LEGAL_ENTITY,
    legalName: 'Cliente de prueba',
    email: 'cliente@example.com',
  };
  const repository = { create: mock.fn(async () => customer) };
  const catalog = { validate: mock.fn(async () => {}) };
  const fiscalValidator = { validate: mock.fn() };
  const service = new CreateCustomerService(
    repository as unknown as CustomersRepository,
    catalog as unknown as CustomerTaxRoleCatalogValidator,
    fiscalValidator as unknown as CustomerFiscalValidator,
  );

  await assert.rejects(service.execute(input, ''), BadRequestException);
  assert.equal(repository.create.mock.callCount(), 0);

  assert.equal(await service.execute(input, COMPANY_ID), customer);
  assert.deepEqual(repository.create.mock.calls[0].arguments, [input, COMPANY_ID]);
});

test('the customers list requires and applies a company filter', async () => {
  const repository = {
    list: mock.fn(async (_input: { companyId: string }) => ({ data: [], total: 0 })),
  };
  const service = new CustomersService(
    repository as unknown as CustomersRepository,
    {} as CreateCustomerService,
    {} as UpdateCustomerService,
  );

  await assert.rejects(service.list({}), BadRequestException);
  assert.equal(repository.list.mock.callCount(), 0);

  await service.list({}, COMPANY_ID);
  assert.equal(repository.list.mock.calls[0]?.arguments[0].companyId, COMPANY_ID);
});

test('creating a customer with an existing email links the existing record instead of duplicating it', async () => {
  const existing = Object.assign(new CustomerEntity(), {
    id: '39a8b8b2-68b4-40ec-9f3a-3bd3f45aa3b0',
    email: 'cliente@example.com',
    companies: [],
  });
  const emailQuery = {
    select: () => emailQuery,
    where: () => emailQuery,
    andWhere: () => emailQuery,
    take: () => emailQuery,
    getMany: async () => [existing],
  };
  const customerRepository = {
    findOne: mock.fn(async () => existing),
    createQueryBuilder: () => emailQuery,
    create: mock.fn(),
    save: mock.fn(),
  };
  const companyRepository = {
    findOne: mock.fn(async () => null),
    create: mock.fn((input: Partial<CustomerCompanyEntity>) =>
      Object.assign(new CustomerCompanyEntity(), input),
    ),
    save: mock.fn(async (link: CustomerCompanyEntity) => {
      existing.companies.push(link);
      return link;
    }),
  };
  const manager = {
    query: mock.fn(async () => []),
    getRepository: (entity: unknown) =>
      entity === CustomerEntity ? customerRepository : companyRepository,
  };
  const dataSource = {
    transaction: async (operation: (value: typeof manager) => unknown) => operation(manager),
  };
  const repository = new CustomersRepository(customerRepository as never, dataSource as never);

  const result = await repository.create(
    {
      nature: CustomerNature.LEGAL_ENTITY,
      legalName: 'Cliente duplicado',
      email: ' CLIENTE@example.com ',
    },
    COMPANY_ID,
  );

  assert.equal(result.id, existing.id);
  assert.equal(customerRepository.create.mock.callCount(), 0);
  assert.equal(customerRepository.save.mock.callCount(), 0);
  assert.equal(manager.query.mock.callCount(), 1);
  assert.equal(companyRepository.save.mock.callCount(), 1);
  assert.equal(companyRepository.save.mock.calls[0].arguments[0].companyId, COMPANY_ID);
});
