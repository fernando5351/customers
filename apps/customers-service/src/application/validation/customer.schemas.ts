import * as Joi from 'joi';
import {
  CustomerIdentificationType,
  CustomerNature,
  CustomerTaxRoleStatus,
  InstitutionalSector,
  PublicEntityType,
  TaxpayerCategory,
  VatStatus,
} from '../../domain/entities';
import {
  CreateCustomerInput,
  GetCustomerByIdInput,
  ListCustomersInput,
  UpdateCustomerInput,
} from '../dto/customer.dto';

const nullableText = (max: number) => Joi.string().trim().max(max).allow(null, '');
const nullableDate = Joi.string().isoDate().allow(null);
const uuid = Joi.string().uuid();

const identificationSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(CustomerIdentificationType))
    .required(),
  value: Joi.string().trim().max(50).required(),
  normalizedValue: Joi.string().trim().max(50).allow(null, ''),
  countryId: Joi.string().trim().uppercase().length(2).default('SV'),
  isPrimary: Joi.boolean().default(false),
  verifiedAt: nullableDate,
});

const taxProfileSchema = Joi.object({
  vatStatus: Joi.string()
    .valid(...Object.values(VatStatus))
    .required(),
  taxpayerCategory: Joi.string()
    .valid(...Object.values(TaxpayerCategory))
    .default(TaxpayerCategory.NOT_APPLICABLE),
  economicActivityId: Joi.string().trim().max(6).allow(null, ''),
  economicActivityDescription: nullableText(250),
  verifiedAt: nullableDate,
  verificationSource: nullableText(250),
  notes: Joi.string().trim().allow(null, ''),
});

const taxRoleSchema = Joi.object({
  taxRoleId: uuid.required(),
  status: Joi.string()
    .valid(...Object.values(CustomerTaxRoleStatus))
    .default(CustomerTaxRoleStatus.PENDING_VERIFICATION),
  rate: Joi.number().min(0).max(1).precision(6).allow(null),
  resolutionNumber: nullableText(100),
  validFrom: nullableDate,
  validUntil: nullableDate,
  verificationSource: nullableText(250),
  verifiedAt: nullableDate,
  notes: nullableText(500),
});

const companySchema = Joi.object({
  companyId: uuid.required(),
});

export const createCustomerSchema = Joi.object<CreateCustomerInput>({
  nature: Joi.string()
    .valid(...Object.values(CustomerNature))
    .required(),
  institutionalSector: Joi.string()
    .valid(...Object.values(InstitutionalSector))
    .default(InstitutionalSector.NOT_APPLICABLE),
  publicEntityType: Joi.string()
    .valid(...Object.values(PublicEntityType))
    .allow(null),
  legalName: Joi.string().trim().min(1).max(200).required(),
  tradeName: nullableText(200),
  countryId: Joi.string().trim().uppercase().length(2).default('SV'),
  departmentId: nullableText(2),
  municipalityId: nullableText(36),
  addressComplement: nullableText(300),
  phone: nullableText(30),
  email: Joi.string().trim().lowercase().email().max(150).allow(null, ''),
  identifications: Joi.array().items(identificationSchema).default([]),
  taxProfile: taxProfileSchema.allow(null),
  taxRoles: Joi.array().items(taxRoleSchema).default([]),
  companies: Joi.array().items(companySchema).default([]),
});

export const getCustomerByIdSchema = Joi.object<GetCustomerByIdInput>({
  id: uuid.required(),
});

export const updateCustomerSchema = Joi.object<UpdateCustomerInput>({
  id: uuid.required(),
  nature: Joi.string()
    .valid(...Object.values(CustomerNature)),
  institutionalSector: Joi.string()
    .valid(...Object.values(InstitutionalSector)),
  publicEntityType: Joi.string()
    .valid(...Object.values(PublicEntityType))
    .allow(null),
  legalName: Joi.string().trim().min(1).max(200),
  tradeName: nullableText(200),
  countryId: Joi.string().trim().uppercase().length(2),
  departmentId: nullableText(2),
  municipalityId: nullableText(36),
  addressComplement: nullableText(300),
  phone: nullableText(30),
  email: Joi.string().trim().lowercase().email().max(150).allow(null, ''),
  identifications: Joi.array().items(identificationSchema),
  taxProfile: taxProfileSchema.allow(null),
  taxRoles: Joi.array().items(taxRoleSchema),
  companies: Joi.array().items(companySchema),
});

export const listCustomersSchema = Joi.object<ListCustomersInput>({
  companyId: uuid.allow(null),
  search: Joi.string().trim().max(200).allow(null, ''),
  nature: Joi.string()
    .valid(...Object.values(CustomerNature))
    .allow(null, ''),
  isActive: Joi.boolean().allow(null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  includeInactive: Joi.boolean().default(false),
});
