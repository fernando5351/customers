import * as Joi from 'joi';
import {
  CreateTaxRoleInput,
  GetTaxRoleByIdInput,
  ListTaxRolesInput,
  UpdateTaxRoleInput,
} from '../dto/tax-role.dto';

const uuid = Joi.string().uuid();
const nullableText = (max: number) => Joi.string().trim().max(max).allow(null, '');
const rate = Joi.number().min(0).max(1).precision(6).allow(null);

export const createTaxRoleSchema = Joi.object<CreateTaxRoleInput>({
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .min(2)
    .max(50)
    .required(),
  name: Joi.string().trim().min(1).max(150).required(),
  description: nullableText(500),
  defaultRate: rate,
  legalBasis: nullableText(250),
  isSystem: Joi.boolean().default(false),
});

export const updateTaxRoleSchema = Joi.object<UpdateTaxRoleInput>({
  id: uuid.required(),
  code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .min(2)
    .max(50)
    .allow(null),
  name: Joi.string().trim().min(1).max(150).allow(null),
  description: nullableText(500),
  defaultRate: rate,
  legalBasis: nullableText(250),
  isActive: Joi.boolean().allow(null),
});

export const getTaxRoleByIdSchema = Joi.object<GetTaxRoleByIdInput>({
  id: uuid.required(),
});

export const listTaxRolesSchema = Joi.object<ListTaxRolesInput>({
  search: Joi.string().trim().max(150).allow(null, ''),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  includeInactive: Joi.boolean().default(false),
});
