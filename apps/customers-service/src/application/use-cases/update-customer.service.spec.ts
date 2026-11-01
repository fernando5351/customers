import 'reflect-metadata';
import { strict as assert } from 'node:assert';
import { mock, test } from 'node:test';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
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
import { validatePayload } from '@takumi/common';
import { updateCustomerSchema } from '../validation/customer.schemas';
import { UpdateCustomerService } from './update-customer.service';
import { UpdateCustomerInput } from '../dto/customer.dto';

function setup() {
  const customer = Object.assign(new CustomerEntity(), {
    id: 'e659ddcf-5dfa-4da2-904e-f251fc1ff850',
    nature: CustomerNature.LEGAL_ENTITY,
    institutionalSector: InstitutionalSector.GOVERNMENTAL,
    publicEntityType: PublicEntityType.MUNICIPALITY,
    legalName: 'Alcaldía', countryId: 'SV', isActive: true, createdAt: new Date(),
    identifications: [{
      type: CustomerIdentificationType.NRC, value: '123456-7',
      normalizedValue: '1234567', countryId: 'SV', isPrimary: true,
    }],
    taxProfile: { vatStatus: VatStatus.VAT_TAXPAYER, taxpayerCategory: TaxpayerCategory.OTHER },
    taxRoles: [], companies: [],
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
  const input = validatePayload(updateCustomerSchema, { id: customer.id, legalName: 'Nueva alcaldía' });
  assert.equal(await service.execute(input), customer);
  assert.deepEqual(repository.update.mock.calls[0].arguments[0], { id: customer.id, legalName: 'Nueva alcaldía' });
});

test('removing the NRC of an existing VAT taxpayer is rejected before persistence', async () => {
  const { customer, repository, service } = setup();
  await assert.rejects(service.execute({ id: customer.id, identifications: [] }), BadRequestException);
  assert.equal(repository.update.mock.callCount(), 0);
});

test('an invalid institutional sector transition is rejected using the existing public entity type', async () => {
  const { customer, repository, service } = setup();
  await assert.rejects(service.execute({ id: customer.id, institutionalSector: InstitutionalSector.PRIVATE }), BadRequestException);
  assert.equal(repository.update.mock.callCount(), 0);
});

test('a missing customer returns not found without writing', async () => {
  const { customer, repository, service } = setup();
  repository.findById.mock.mockImplementation(async () => null);
  await assert.rejects(service.execute({ id: customer.id, legalName: 'Nuevo nombre' }), NotFoundException);
  assert.equal(repository.update.mock.callCount(), 0);
});

test('a newly assigned role must pass catalog validation before writing', async () => {
  const { customer, repository, catalog, service } = setup();
  catalog.validate.mock.mockImplementation(async () => { throw new BadRequestException('Rol inexistente'); });
  await assert.rejects(service.execute({ id: customer.id, taxRoles: [{ taxRoleId: 'missing-role' }] }), BadRequestException);
  assert.equal(repository.update.mock.callCount(), 0);
});
